<img width="640" alt="d7984783c3ab174a45b6af1ed037dd2" src="https://github.com/user-attachments/assets/3ab49415-b78b-4c49-9dc5-0142e13ba054" /># Voxel Drawing Tool

A powerful browser-based voxel editor that transforms 2D images into customizable 3D voxel art using p5.js.

![image](https://github.com/user-attachments/assets/4ab66b85-3f96-4a49-bb51-7da339222080)

## Features

- **Image to Voxel Conversion**: Upload any image and convert it instantly to 3D voxels
- **Multiple Depth Estimation Methods**: Generate depth using brightness, RGB channels, saturation, or hue
- **Customizable Resolution**: Adjust voxel density with the resolution slider
- **Color Manipulation**:
  - Apply curated color palettes (Pastel, Neon, Earth, Ocean)
  - Select voxels by color similarity
  - Background removal tool
- **Advanced Editing**:
  - Fill extrusion option for solid models
  - Customizable depth calculations
  - Undo/redo support
- **3D Navigation**: Intuitive camera controls for rotation, pan, and zoom
- **Export Options**: Export to standard 3D formats (OBJ, OBJ+MTL)
- **Responsive Design**: Light/dark mode and responsive layout

## Installation

1. Clone the repository: git clone https://github.com/yourusername/voxel-drawing-tool.git
2. Open the project folder: cd voxel-drawing-tool
3. Since this is a client-side application, no installation is required. Simply open the `index.html` file in any modern browser: open index.html


## Usage

1. **Getting Started**:
- Click the "Upload Image" button to select an image
- Adjust the resolution slider to set voxel size
- Use the depth slider to control extrusion amount

2. **Editing Voxels**:
- Click on the model to select voxels by color
- Adjust the color threshold slider to refine selection
- Apply different color palettes with the palette buttons
- Try different depth modes (Brightness, Red, Green, Blue, etc.)

3. **Exporting**:
- Use the "Export OBJ" button to download your model
- For more advanced exports with materials, use "Export OBJ+MTL"

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
