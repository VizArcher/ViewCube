import ThreeScene from './components/MainViewer/ThreeScene';
import TrameViewer from './components/MainViewer/TrameViewer';
import ViewCube from './components/ViewCube/ViewCube';

function App() {
    return (
        <div>
            {/* The Main Viewer (Background) */}
            <TrameViewer />

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

// import TrameViewer from './components/MainViewer/TrameViewer';
// import ViewCube from './components/ViewCube/ViewCube';
// import './App.css';
// 
// const App = () => {
//     return (
//         <div style={{ 
//             position: 'relative', 
//             width: '100vw', 
//             height: '100vh',
//             overflow: 'hidden',
//             margin: 0,
//             padding: 0
//         }}>
//             {/* Main 3D Viewer - now using Trame instead of ThreeScene */}
//             <TrameViewer />
//             
//             {/* ViewCube overlay - stays in Three.js */}
//             <ViewCube />
//         </div>
//     );
// };
// 
// export default App;