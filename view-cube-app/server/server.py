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

from trame.app import get_server
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


# -----------------------------------------------------------------------------
# TRAME
# -----------------------------------------------------------------------------

server = get_server(client_type="vue3")
state, ctrl = server.state, server.controller
state.trame__title = "Camera Sync"

state.camera = {
    "position": renderer.GetActiveCamera().GetPosition(),
    "target": renderer.GetActiveCamera().GetFocalPoint(),
    "up": renderer.GetActiveCamera().GetViewUp(),
}

# -----------------------------------------------------------------------------
# UI
# -----------------------------------------------------------------------------

with SinglePageLayout(server) as layout:
    layout.title.set_text("Trame Camera Sync")

    with layout.content:
        iframe.Communicator(target_origin="*", enable_rpc=True)

        view = vtk_widgets.VtkLocalView(
            renderWindow,
            # 🔑 THIS IS CRITICAL
            interactive=True,
            update_camera_on_interaction=True,
        )

        ctrl.view_update = view.update

# -----------------------------------------------------------------------------

if __name__ == "__main__":
    print("http://localhost:8080")
    server.start(port=8080)
