import ThreeScene from './components/MainViewer/ThreeScene';
import ViewCube from './components/ViewCube/ViewCube';

function App() {
    return (
        <div>
            {/* The Main Viewer (Background) */}
            <ThreeScene />

            {/* The UI Overplay (Foreground) */}
            <ViewCube />

            {/* Optional: Simple instruction overlay */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                color: 'white',
                fontFamily: 'sans-serif',
                pointerEvents: 'none',
                opacity: 0.7
            }}>
                <p>• Drag background to orbit</p>
                <p>• Click Cube faces to animate</p>
            </div>
        </div>
    );
}

export default App;