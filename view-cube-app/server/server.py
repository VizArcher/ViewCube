# noinspection PyUnresolvedReferences
import vtkmodules.vtkInteractionStyle
# noinspection PyUnresolvedReferences
import vtkmodules.vtkRenderingOpenGL2
from vtkmodules.vtkCommonColor import vtkNamedColors
from vtkmodules.vtkFiltersSources import vtkSphereSource, vtkConeSource
from vtkmodules.vtkInteractionStyle import vtkInteractorStyleTrackballCamera
from vtkmodules.vtkRenderingCore import (
    vtkActor,
    vtkPolyDataMapper,
    vtkRenderWindow,
    vtkRenderWindowInteractor,
    vtkRenderer
)
from trame.app import get_server
from trame.ui.vuetify3 import SinglePageLayout
from trame.widgets import vuetify3, vtk as vtk_widgets, iframe
import math

server = get_server(client_type="vue3")
state, ctrl = server.state, server.controller


class MyInteractorStyle(vtkInteractorStyleTrackballCamera):

    def __init__(self, parent=None):
        super().__init__()
        self.AddObserver('LeftButtonPressEvent', self.left_button_press_event)
        self.AddObserver('LeftButtonReleaseEvent', self.left_button_release_event)
        self.AddObserver('MouseWheelForwardEvent', self.mouse_wheel_event)
        self.AddObserver('MouseWheelBackwardEvent', self.mouse_wheel_event)
        self.AddObserver('MiddleButtonPressEvent', self.middle_button_press_event)
        self.AddObserver('MiddleButtonReleaseEvent', self.middle_button_release_event)
        self.AddObserver('RightButtonPressEvent', self.right_button_press_event)
        self.AddObserver('RightButtonReleaseEvent', self.right_button_release_event)

    def left_button_press_event(self, obj, event):
        print('Left Button pressed')
        self.OnLeftButtonDown()
        return

    def left_button_release_event(self, obj, event):
        print('Left Button released')
        self.OnLeftButtonUp()
        self.update_camera_state()
        return

    def middle_button_press_event(self, obj, event):
        self.OnMiddleButtonDown()
        return

    def middle_button_release_event(self, obj, event):
        self.OnMiddleButtonUp()
        self.update_camera_state()
        return

    def right_button_press_event(self, obj, event):
        self.OnRightButtonDown()
        return

    def right_button_release_event(self, obj, event):
        self.OnRightButtonUp()
        self.update_camera_state()
        return

    def mouse_wheel_event(self, obj, event):
        # Call the parent class method first
        if event == 'MouseWheelForwardEvent':
            self.OnMouseWheelForward()
        else:
            self.OnMouseWheelBackward()
        self.update_camera_state()
        return

    def update_camera_state(self):
        """Update camera state after interaction ends"""
        camera = renderer.GetActiveCamera()
        camera_position = list(camera.GetPosition())
        camera_target = list(camera.GetFocalPoint())
        camera_up = list(camera.GetViewUp())
    
        print("Camera updated via interaction")
        print("  Position :", camera_position)
        print("  Target   :", camera_target)
        print("  Up       :", camera_up)

        # Update state with flush to ensure changes propagate
        with state:
            state.camera_position = camera_position
            state.camera_target = camera_target
            state.camera_up = camera_up
        
        # Force view update
        ctrl.view_update()


# Create VTK pipeline
source = vtkConeSource()

mapper = vtkPolyDataMapper()
mapper.SetInputConnection(source.GetOutputPort())

actor = vtkActor()
actor.SetMapper(mapper)

renderer = vtkRenderer()
renderer.AddActor(actor)

renwin = vtkRenderWindow()
renwin.AddRenderer(renderer)
renwin.OffScreenRenderingOn()

interactor = vtkRenderWindowInteractor()
interactor.SetInteractorStyle(MyInteractorStyle())
interactor.SetRenderWindow(renwin)

camera = renderer.GetActiveCamera()
# ---- Camera state ----
state.camera_position = list(camera.GetPosition())
state.camera_target = list(camera.GetFocalPoint())
state.camera_up = list(camera.GetViewUp())

@state.change("camera_position", "camera_target", "camera_up")
def on_camera_state_update(camera_position, camera_target, camera_up, **kwargs):
    """React to camera state changes"""
    print("Camera state changed externally")
    print("  Position :", camera_position)
    print("  Target   :", camera_target)
    print("  Up       :", camera_up)

@ctrl.trigger("reset_resolution")
def reset_resolution(position, target, up):
    # ---- Convert inputs to vectors ----
    px, py, pz = position
    tx, ty, tz = target
    ux, uy, uz = up

    # ---- Forward (view) vector ----
    fx = tx - px
    fy = ty - py
    fz = tz - pz

    # Normalize forward
    f_len = math.sqrt(fx*fx + fy*fy + fz*fz)
    fx /= f_len
    fy /= f_len
    fz /= f_len

    # ---- Yaw & Pitch from forward ----
    yaw = math.atan2(fx, fz)             # rotation around Y
    pitch = math.asin(-fy)               # rotation around X

    # ---- Compute Right vector ----
    # right = forward x up
    rx = fy * uz - fz * uy
    ry = fz * ux - fx * uz
    rz = fx * uy - fy * ux

    r_len = math.sqrt(rx*rx + ry*ry + rz*rz)
    rx /= r_len
    ry /= r_len
    rz /= r_len

    # ---- Recomputed Up vector ----
    upx = ry * fz - rz * fy
    upy = rz * fx - rx * fz
    upz = rx * fy - ry * fx

    # ---- Roll (compare with world up) ----
    world_up = (0.0, 1.0, 0.0)
    dot_up = upx * world_up[0] + upy * world_up[1] + upz * world_up[2]
    dot_right = rx * world_up[0] + ry * world_up[1] + rz * world_up[2]

    roll = math.atan2(dot_right, dot_up)

    # ---- Convert to degrees ----
    pitch_deg = int(math.degrees(pitch))
    yaw_deg   = int(math.degrees(yaw))
    roll_deg  = int(math.degrees(roll))

    print("Orientation (deg)")
    print("Pitch:", pitch_deg, "Yaw:", yaw_deg, "Roll:", roll_deg)

    # ---- Apply to actor ----
    actor.SetOrientation(pitch_deg, yaw_deg, roll_deg)
    ctrl.view_update()

@ctrl.trigger("reset_camera")
def reset_camera():
    """Reset camera to default view"""
    ctrl.view_reset_camera()
    
    # Update state after reset
    camera = renderer.GetActiveCamera()
    with state:
        state.camera_position = list(camera.GetPosition())
        state.camera_target = list(camera.GetFocalPoint())
        state.camera_up = list(camera.GetViewUp())

# Create trame UI
with SinglePageLayout(server) as layout:
    layout.title.set_text("VTK Mouse Events")
    
    with layout.content:
        iframe.Communicator(target_origin="http://localhost:5173", enable_rpc=True)

        with vuetify3.VContainer(fluid=True, classes="fill-height pa-0"):
            view = vtk_widgets.VtkRemoteView(
                renwin,
                camera_position=("camera_position",),
                camera_focal_point=("camera_target",),
                camera_view_up=("camera_up",),
                interactor_events=(
                    "events",
                    ["EndAnimation"],
                )
            )
            ctrl.view_update = view.update
            ctrl.view_reset_camera = view.reset_camera


if __name__ == '__main__':
    server.start()