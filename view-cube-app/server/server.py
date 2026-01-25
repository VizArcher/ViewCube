'''from trame.app import get_server
from trame.ui.vuetify3 import SinglePageLayout
from trame.widgets import iframe, vuetify3 as vuetify, vtk as vtk_widgets

from vtkmodules.vtkFiltersSources import vtkSphereSource
from vtkmodules.vtkFiltersSources import vtkCubeSource
from vtkmodules.vtkRenderingCore import (
    vtkRenderer,
    vtkRenderWindow,
    vtkRenderWindowInteractor,
    vtkPolyDataMapper,
    vtkActor,
)
from vtkmodules.vtkInteractionStyle import vtkInteractorStyleSwitch

# VTK Pipeline Setup
renderer = vtkRenderer()
renderer.SetBackground(0.13, 0.13, 0.13)

renderWindow = vtkRenderWindow()
renderWindow.AddRenderer(renderer)

renderWindowInteractor = vtkRenderWindowInteractor()
renderWindowInteractor.SetRenderWindow(renderWindow)
renderWindowInteractor.GetInteractorStyle().SetCurrentStyleToTrackballCamera()

# Add sphere geometry
sphere_source = vtkSphereSource()
sphere_source.SetRadius(2.0)
sphere_source.SetThetaResolution(50)
sphere_source.SetPhiResolution(50)

cube_source = vtkCubeSource()
cube_source.SetXLength(2.0)
cube_source.SetYLength(2.0)
cube_source.SetZLength(2.0)

mapper = vtkPolyDataMapper()
mapper.SetInputConnection(cube_source.GetOutputPort())

actor = vtkActor()
actor.SetMapper(mapper)
actor.GetProperty().SetColor(0.4, 0.8, 1.0)
actor.GetProperty().SetSpecular(0.8)
actor.GetProperty().SetSpecularPower(30)

renderer.AddActor(actor)
renderer.ResetCamera()
renderWindow.Render()

# Initialize Trame server
server = get_server(client_type="vue3")
state, ctrl = server.state, server.controller

# Camera state - synchronized with React ViewCube
state.camera_position = [0, 0, 10]
state.camera_target = [0, 0, 0]
state.camera_up = [0, 1, 0]

# Get camera reference
camera = renderer.GetActiveCamera()
camera.SetPosition(0, 0, 10)
camera.SetFocalPoint(0, 0, 0)
camera.SetViewUp(0, 1, 0)


@state.change("camera_position", "camera_target", "camera_up")
def update_camera_from_viewcube(camera_position, camera_target, camera_up, **kwargs):
    """Update VTK camera when ViewCube changes state"""
    print(f"Camera update from ViewCube: pos={camera_position}, target={camera_target}, up={camera_up}")
    
    camera.SetPosition(*camera_position)
    camera.SetFocalPoint(*camera_target)
    camera.SetViewUp(*camera_up)
    
    ctrl.view_update()


@ctrl.trigger("on_camera_interaction")
def on_camera_interaction():
    """Called when user interacts with the VTK viewer"""
    pos = list(camera.GetPosition())
    focal = list(camera.GetFocalPoint())
    up = list(camera.GetViewUp())
    
    print(f"Camera interaction in Trame: pos={pos}, target={focal}, up={up}")
    
    # Update state to sync with ViewCube
    state.update({
        "camera_position": pos,
        "camera_target": focal,
        "camera_up": up
    })


# UI Layout
with SinglePageLayout(server) as layout:
    layout.title.set_text("Trame + ViewCube Integration")
    
    with layout.content:
        # CRITICAL: This enables communication with React app
        iframe.Communicator(target_origin="*", enable_rpc=True)
        
        with vuetify.VContainer(fluid=True, classes="pa-0 fill-height"):
            html_view = vtk_widgets.VtkLocalView(
                renderWindow,
                on_camera_end=(ctrl.on_camera_interaction, "[]"),
            )
            ctrl.view_update = html_view.update


if __name__ == "__main__":
    print("Starting Trame server on http://localhost:8080")
    print("Make sure React app is running on http://localhost:3000")
    server.start(port=8080)'''

'''from trame.app import get_server
from trame.ui.vuetify3 import SinglePageLayout
from trame.widgets import iframe, vuetify3 as vuetify, vtk as vtk_widgets

from vtkmodules.vtkFiltersSources import vtkCubeSource
from vtkmodules.vtkRenderingCore import (
    vtkRenderer,
    vtkRenderWindow,
    vtkRenderWindowInteractor,
    vtkPolyDataMapper,
    vtkActor,
)
from vtkmodules.vtkInteractionStyle import vtkInteractorStyleSwitch

### Setup VTK pipeline
renderer = vtkRenderer()
renderer.SetBackground(0.13, 0.13, 0.13)

renderWindow = vtkRenderWindow()
renderWindow.AddRenderer(renderer)

renderWindowInteractor = vtkRenderWindowInteractor()
renderWindowInteractor.SetRenderWindow(renderWindow)
renderWindowInteractor.GetInteractorStyle().SetCurrentStyleToTrackballCamera()

# Add cube geometry
cube_source = vtkCubeSource()
cube_source.SetXLength(2.0)
cube_source.SetYLength(2.0)
cube_source.SetZLength(2.0)

mapper = vtkPolyDataMapper()
mapper.SetInputConnection(cube_source.GetOutputPort())

actor = vtkActor()
actor.SetMapper(mapper)
actor.GetProperty().SetColor(0.4, 0.8, 1.0)
actor.GetProperty().SetSpecular(0.8)
actor.GetProperty().SetSpecularPower(30)

renderer.AddActor(actor)
renderer.ResetCamera()
renderWindow.Render()

# Initialize Trame server
server = get_server(client_type="vue3")
state, ctrl = server.state, server.controller

# Camera state - synchronized with React ViewCube
state.camera_position = [0, 0, 10]
state.camera_target = [0, 0, 0]
state.camera_up = [0, 1, 0]
state.camera_source = "INIT"

# Get camera reference
camera = renderer.GetActiveCamera()
camera.SetPosition(0, 0, 10)
camera.SetFocalPoint(0, 0, 0)
camera.SetViewUp(0, 1, 0)


state.camera = {
    "position": camera.GetPosition(),
    "target": camera.GetFocalPoint(),
    "up": camera.GetViewUp(),
}


@state.change("camera_position", "camera_target", "camera_up")
def update_camera_from_viewcube(camera_position, camera_target, camera_up, **kwargs):
    """Update VTK camera when ViewCube changes state"""
    # Skip if this is from user interaction in Trame viewer
    if state.camera_source == "VIEWER":
        return
    
    # Skip initial setup
    if state.camera_source == "INIT":
        return
    
    print(f"Updating camera from ViewCube: pos={camera_position}, target={camera_target}, up={camera_up}")
    
    # Update camera directly - VTK will handle smoothly
    camera.SetPosition(*camera_position)
    camera.SetFocalPoint(*camera_target)
    camera.SetViewUp(*camera_up)
    
    # Trigger view update
    ctrl.view_update()


@ctrl.trigger("on_camera_changed")
def on_camera_changed():
    """Called when user interacts with the VTK viewer"""
    pos = list(camera.GetPosition())
    focal = list(camera.GetFocalPoint())
    up = list(camera.GetViewUp())
    
    print(f"Camera changed in Trame: pos={pos}, target={focal}, up={up}")
    
    # Update state to sync with ViewCube
    state.camera_source = "VIEWER"
    state.camera_position = pos
    state.camera_target = focal
    state.camera_up = up
    state.flush()


# UI Layout
with SinglePageLayout(server) as layout:
    layout.title.set_text("Trame + ViewCube Integration")
    
    with layout.content:
        # CRITICAL: This enables communication with React app
        iframe.Communicator(target_origin="*", enable_rpc=True)
        
        with vuetify.VContainer(fluid=True, classes="pa-0 fill-height"):
            html_view = vtk_widgets.VtkLocalView(
                renderWindow,
            )
            # Register callbacks
            ctrl.view_update = html_view.update
            ctrl.view_reset_camera = html_view.reset_camera
            
            # Capture camera interaction events
            renderWindowInteractor.AddObserver('EndInteractionEvent', lambda obj, event: on_camera_changed())


if __name__ == "__main__":
    print("Starting Trame server on http://localhost:8080")
    server.start(port=8080)'''

'''from trame.app import get_server
from trame.ui.vuetify3 import SinglePageLayout
from trame.widgets import iframe, vtk as vtk_widgets

from vtkmodules.vtkFiltersSources import vtkCubeSource
from vtkmodules.vtkRenderingCore import (
    vtkRenderer,
    vtkRenderWindow,
    vtkPolyDataMapper,
    vtkActor,
)

# -----------------------------------------------------------------------------
# VTK PIPELINE
# -----------------------------------------------------------------------------

renderer = vtkRenderer()
renderer.SetBackground(0.13, 0.13, 0.13)

renderWindow = vtkRenderWindow()
renderWindow.AddRenderer(renderer)

cube = vtkCubeSource()
mapper = vtkPolyDataMapper()
mapper.SetInputConnection(cube.GetOutputPort())

actor = vtkActor()
actor.SetMapper(mapper)
renderer.AddActor(actor)
renderer.ResetCamera()
renderWindow.Render()

# -----------------------------------------------------------------------------
# TRAME
# -----------------------------------------------------------------------------

server = get_server(client_type="vue3")
state, ctrl = server.state, server.controller
state.trame__title = "LocalView Camera (Client Driven)"

@ctrl.trigger("set_camera")
def set_camera(camera):
    print("📥 Camera received from React:", camera)

@ctrl.trigger("reset_camera")
def reset_camera():
    renderer.ResetCamera()
    ctrl.view_update()

# -----------------------------------------------------------------------------
# UI
# -----------------------------------------------------------------------------

with SinglePageLayout(server) as layout:
    layout.title.set_text("Trame LocalView")

    with layout.content:
        iframe.Communicator(target_origin="*", enable_rpc=True)

        view = vtk_widgets.VtkLocalView(
            renderWindow,
            interactive=True,
        )
        ctrl.view_update = view.update
        ctrl.view_reset_camera = view.reset_camera

# -----------------------------------------------------------------------------

if __name__ == "__main__":
    print("Running on http://localhost:8080")
    server.start(port=8080)
'''

from trame.app import get_server
from trame.ui.vuetify3 import SinglePageLayout
from trame.widgets import iframe, vuetify3 as vuetify, vtk as vtk_widgets

from vtkmodules.vtkFiltersSources import vtkConeSource
from vtkmodules.vtkRenderingCore import (
    vtkRenderer,
    vtkRenderWindow,
    vtkRenderWindowInteractor,
    vtkPolyDataMapper,
    vtkActor,
)
from vtkmodules.vtkInteractionStyle import vtkInteractorStyleSwitch  # noqa
import math

### Setup some VTK pipeline
renderer = vtkRenderer()
renderWindow = vtkRenderWindow()
renderWindow.AddRenderer(renderer)

renderWindowInteractor = vtkRenderWindowInteractor()
renderWindowInteractor.SetRenderWindow(renderWindow)
renderWindowInteractor.GetInteractorStyle().SetCurrentStyleToTrackballCamera()

cone_source = vtkConeSource()
mapper = vtkPolyDataMapper()
actor = vtkActor()
mapper.SetInputConnection(cone_source.GetOutputPort())
actor.SetMapper(mapper)
renderer.AddActor(actor)
renderer.ResetCamera()
renderWindow.Render()

server = get_server(client_type="vue3")
state, ctrl = server.state, server.controller


camera = renderer.GetActiveCamera()
# ---- Camera state ----
state.camera_position = []
state.camera_target = []
state.camera_up = []

state.trame__title = "Trame React iframe example"

state.interaction_mode = "interact"
state.selection_updated = True
state.interactor_settings = []

DEFAULT_RESOLUTION = 6

VIEW_INTERACT = [
    {"button": 1, "action": "Rotate"},
    {"button": 2, "action": "Pan"},
    {"button": 3, "action": "Zoom", "scrollEnabled": True},
    {"button": 1, "action": "Pan", "alt": True},
    {"button": 1, "action": "Zoom", "control": True},
    {"button": 1, "action": "Pan", "shift": True},
    {"button": 1, "action": "Roll", "alt": True, "shift": True},
]

VIEW_SELECT = [{"button": 1, "action": "Select"}]

@state.change("camera_position", "camera_target", "camera_up")
def on_camera_state_update(camera_position, camera_target, camera_up, **kwargs):
    camera_position = camera.GetPosition()
    camera_target = camera.GetFocalPoint()
    camera_up = camera.GetViewUp()
    
    print("Camera updated")
    print("  Position :", camera_position)
    print("  Target   :", camera_target)
    print("  Up       :", camera_up)

    state.camera_position = camera_position
    state.camera_target = camera_target
    state.camera_up = camera_up
    state.flush()


@state.change("interaction_mode")
def update_picking_mode(interaction_mode, **kwargs):
    print(f"state change - updating interaction mode: {interaction_mode}")

    if interaction_mode == "interact":
        state.update(
            {
                "interactor_settings": VIEW_INTERACT,
            }
        )
    else:
        state.interactor_settings = VIEW_SELECT if interaction_mode == "select" else VIEW_INTERACT

    state.flush()

@ctrl.trigger("get_number_of_cells")
def get_number_of_cells():
    cone = cone_source.GetOutput()
    return cone.GetNumberOfCells()

@ctrl.trigger("raise_error")
def raise_error():
    renderer.GetActiveCamera().SetPosition(0, 0, 10)
    raise RuntimeError(renderer.GetActiveCamera().GetPosition())

@state.change("resolution")
def update_cone(resolution, **kwargs):
    print(f"state change - updating resolution to {resolution}")

    cone_source.SetResolution(resolution)
    ctrl.view_update()

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


'''
@ctrl.trigger("reset_resolution")
def reset_resolution(position, target, up):
    print("YAHOOO")
    print(str(position[0]) + ", " + str(position[1]) + ", " + str(position[2]))
    print(str(up[0]) + ", " + str(up[1]) + ", " + str(up[2]))
    
    camera = renderer.GetActiveCamera()
    camera.SetPosition(position[0], position[1], position[2])
    camera.SetViewUp(up[0], up[1], up[2])
    camera.SetFocalPoint(target[0], target[1], target[2])
    # 2. Retrieve current value, increment it, and update state
    # new_x = state.x_rotation + 45
    # state.x_rotation = new_x
    
    # 3. Apply the rotation to the VTK actor
    # actor.SetOrientation(0, new_x, 0)
    
    # 4. Reset other properties
    # state.resolution = DEFAULT_RESOLUTION
    ctrl.view_update()
'''

# -----------------------------------------------------------------------------


with SinglePageLayout(server) as layout:
    layout.icon.click = ctrl.view_reset_camera
    ctrl.trigger("reset_camera")(ctrl.view_reset_camera)
    layout.title.set_text("Trame Iframe - Cone Application")

    with layout.toolbar:
        vuetify.VSpacer()
        vuetify.VSlider(
            v_model=("resolution", DEFAULT_RESOLUTION),
            min=3,
            max=60,
            step=1,
            hide_details=True,
            dense=True,
            style="max-width: 300px",
        )
        vuetify.VDivider(vertical=True, classes="mx-2")

        with vuetify.VBtn(icon=True, click=reset_resolution):
            vuetify.VIcon("mdi-undo-variant")

    with layout.content:
        iframe.Communicator(target_origin="http://localhost:5173", enable_rpc=True)

        html_view = vtk_widgets.VtkLocalView(
            renderWindow,
            camera_position=("camera_position",),
            camera_focal_point=("camera_target",),
            camera_view_up=("camera_up",),
            interactor_settings=("interactor_settings",)
        )
        ctrl.view_reset_camera = html_view.reset_camera
        ctrl.view_update = html_view.update

if __name__ == "__main__":
    server.start()
