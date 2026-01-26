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
    
    def left_button_press_event(self, obj, event):
        print('Left Button pressed')
        self.OnLeftButtonDown()
        return

    def left_button_release_event(self, obj, event):
        print('Left Button released')
        self.OnLeftButtonUp()
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

# Store initial camera state
camera = renderer.GetActiveCamera()
INITIAL_CAMERA_POSITION = list(camera.GetPosition())
INITIAL_CAMERA_TARGET = list(camera.GetFocalPoint())
INITIAL_CAMERA_UP = list(camera.GetViewUp())
INITIAL_ACTOR_ORIENTATION = (0, 0, 0)  # pitch, yaw, roll

# Initialize state with initial values
state.camera_position = INITIAL_CAMERA_POSITION.copy()
state.camera_target = INITIAL_CAMERA_TARGET.copy()
state.camera_up = INITIAL_CAMERA_UP.copy()

@state.change("camera_position", "camera_target", "camera_up")
def on_camera_state_update(camera_position, camera_target, camera_up, **kwargs):
    """React to camera state changes"""
    print("Camera state changed externally")
    print("  Position :", camera_position)
    print("  Target   :", camera_target)
    print("  Up       :", camera_up)

@ctrl.trigger("reset_to_initial_state")
def reset_to_initial_state():
    """Reset everything to initial state (called on browser refresh)"""
    print("Resetting to initial state...")
    
    # Reset camera
    camera = renderer.GetActiveCamera()
    camera.SetPosition(INITIAL_CAMERA_POSITION)
    camera.SetFocalPoint(INITIAL_CAMERA_TARGET)
    camera.SetViewUp(INITIAL_CAMERA_UP)
    
    # Reset actor orientation
    actor.SetOrientation(INITIAL_ACTOR_ORIENTATION)
    
    # Update state
    with state:
        state.camera_position = INITIAL_CAMERA_POSITION.copy()
        state.camera_target = INITIAL_CAMERA_TARGET.copy()
        state.camera_up = INITIAL_CAMERA_UP.copy()
    
    # Update view
    ctrl.view_update()
    print("Reset complete!")

@ctrl.trigger("viewCube_to_trame")
def viewCube_to_trame(position, target, up):
    camera = renderer.GetActiveCamera()
    camera.SetPosition(position[0], position[1], position[2])
    camera.SetFocalPoint(target[0], target[1], target[2])
    camera.SetViewUp(up[0], up[1], up[2])
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
        iframe.Communicator(target_origin="*", enable_rpc=True)

        with vuetify3.VContainer(fluid=True, classes="fill-height pa-0"):
            view = vtk_widgets.VtkRemoteView(renwin)
            ctrl.view_update = view.update
            ctrl.view_reset_camera = view.reset_camera


if __name__ == '__main__':
    server.start()