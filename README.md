# 📦 ViewCube – Camera Orientation System

A parametric **ViewCube interaction system** built using Three.js to control scene camera orientation in a deterministic, CAD-like manner.

This project focuses on mathematically correct camera transitions, orientation control, and up-vector stability across face, edge, and vertex interactions — similar to professional CAD environments.

---

## 🔗 Live Deployments

### ✅ Level 1 – Core ViewCube + Camera Orientation

**Live Demo:**
[https://view-cube.vercel.app/](https://view-cube.vercel.app/)

Includes:

* Scene setup
* Camera configuration
* ViewCube interaction (faces)
* Deterministic camera transitions
* Basic up-vector handling

---

### 🚀 Level 2 – Extended Interaction + Trame Integration (WIP)

**Live Demo:**
[https://viewcubetrame.vercel.app/](https://viewcubetrame.vercel.app/)

⚠️ Note: The deployed version has high latency due to renderer integration and production configuration. A demo video is provided below for smoother visualization.

Includes:

* Face, edge, and vertex interaction
* Extended orientation mapping
* Up-vector refinement across multiple views
* Initial Trame renderer wiring
* Improved camera transition logic

---

## 🎯 Project Goal

To build a reusable and mathematically consistent **ViewCube system** that:

* Controls camera orientation via cube interactions
* Supports face, edge, and vertex selection
* Maintains deterministic up-vector behavior
* Produces smooth animated transitions
* Can integrate with alternate renderers (e.g., Trame)

This mirrors interaction patterns found in CAD tools like SolidWorks, Fusion 360, and Blender.

---

## 🧠 Core Engineering Concepts

This project is not just UI work — it required mechanical and mathematical reasoning:

### 1️⃣ Camera Coordinate System Design

* Defined consistent world coordinate frame
* Managed camera position vectors relative to target
* Maintained invariant distance from focal point

### 2️⃣ View Mapping Logic

Each cube element maps to a predefined direction vector:

* Faces → Primary axes (±X, ±Y, ±Z)
* Edges → Axis combinations (e.g., +X +Y)
* Vertices → 3-axis combinations (e.g., +X +Y +Z)

These are normalized before camera placement.

---

### 3️⃣ Up-Vector Handling

The most critical challenge:

When transitioning between views (especially Top/Bottom),
the camera’s up-vector must be corrected to avoid:

* Sudden roll flips
* Gimbal-like behavior
* Inconsistent orientation perception

This required:

* Conditional up-vector reassignment
* Stable transition interpolation
* Orientation normalization across view states

---

### 4️⃣ Smooth Animated Transitions

* Camera position interpolation
* Target locking
* Rotation stabilization
* Deterministic final orientation

---

## ⚙️ Technical Stack

* Three.js
* JavaScript
* Python
* Vite
* Trame (Level 2 integration)
* Vercel (deployment)
* Render (for level 2 trame backend)

---

## 🧪 Current Limitations

* Level 2 deployment has high latency due to renderer wiring
* Production optimization pending

---

## 📹 Demo Video (Level 2)

Since the deployed PR2 instance has high latency,
a demo video demonstrating stable transitions and interactions is attached here:

👉 [Watch the demo video](https://drive.google.com/file/d/13PKWiVd3Oz3DIJT2Axo4rVyPvNrkRRe7/view?usp=sharing)

---

## 🔮 Next Improvements

* Fully stable up-vector algorithm
* Performance optimization
* Production-ready Trame integration
* Extract as reusable npm package
* Add unit tests for orientation mapping

---

## 📬 Discussion

If you're building:

* CAD tools
* Simulation platforms
* Digital twin systems
* Engineering visualization software

I’d be happy to discuss architectural decisions and implementation details.

