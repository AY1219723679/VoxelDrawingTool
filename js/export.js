/**
 * export.js
 * Handles exporting voxel models to different 3D formats
 */

// Import the state to access voxels and voxelSize
import * as state from './state.js';

// Export to OBJ
export function exportToOBJ() {
    let objLines = [];
    let vertexOffset = 1;
  
    for (const voxel of state.voxels) {
      const x = voxel.x;
      const y = voxel.y;
      const z = voxel.z;
      const s = state.voxelSize / 2;
  
      // Define 8 vertices of the cube
      const vertices = [
        [x - s, y - s, z - s],
        [x + s, y - s, z - s],
        [x + s, y + s, z - s],
        [x - s, y + s, z - s],
        [x - s, y - s, z + s],
        [x + s, y - s, z + s],
        [x + s, y + s, z + s],
        [x - s, y + s, z + s],
      ];
  
      // Add vertices to obj lines
      for (const v of vertices) {
        objLines.push(`v ${v[0]} ${v[1]} ${v[2]}`);
      }
  
      // Define cube faces (each face uses 4 vertices)
      const faces = [
        [0, 1, 2, 3], // Bottom
        [4, 5, 6, 7], // Top
        [0, 1, 5, 4], // Front
        [1, 2, 6, 5], // Right
        [2, 3, 7, 6], // Back
        [3, 0, 4, 7], // Left
      ];
  
      for (const face of faces) {
        const indices = face.map(i => i + vertexOffset);
        objLines.push(`f ${indices[0]} ${indices[1]} ${indices[2]} ${indices[3]}`);
      }
  
      vertexOffset += 8;
    }
  
    // Convert to Blob and trigger download
    const objContent = objLines.join('\n');
    const blob = new Blob([objContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voxel_art.obj';
    a.click();
    
    URL.revokeObjectURL(url);
}

// Export to OBJ with MTL
export function exportToOBJWithMTL() {
    console.log("Starting OBJ+MTL export for Rhino compatibility...");
    
    if (state.voxels.length === 0) {
        console.error("Error: No voxels to export!");
        alert("No voxels to export. Please create some voxels first.");
        return;
    }

    try {
        const objLines = [];
        const mtlLines = [];
        const filename = 'voxel_art';
        const mtlFilename = `${filename}.mtl`;
        
        // Add MTL reference to OBJ file - Moving this closer to top of file for Rhino
        objLines.push(`# Voxel Art export - optimized for Rhino`);
        objLines.push(`o VoxelModel`); // Main object name
        objLines.push(`mtllib ${mtlFilename}`);
        objLines.push(`# Created with Voxel Drawing Tool`);
        objLines.push(``);
        
        // Track unique colors to create materials
        const uniqueColors = {};
        const materialNames = {};
        let materialIndex = 0;
        
        // First pass: collect all unique colors and create materials
        console.log("Collecting unique colors for materials...");
        state.voxels.forEach(voxel => {
            const { color } = voxel;
            
            // Extract RGB values safely
            let r, g, b;
            let colorKey;
            
            if (typeof color === 'string') {
                // Handle hex color strings
                if (color.startsWith('#')) {
                    r = parseInt(color.slice(1, 3), 16);
                    g = parseInt(color.slice(3, 5), 16);
                    b = parseInt(color.slice(5, 7), 16);
                    colorKey = `${r}_${g}_${b}`;
                } else if (color.startsWith('rgb')) {
                    // Handle rgb() format
                    const rgbValues = color.match(/\d+/g);
                    if (rgbValues && rgbValues.length >= 3) {
                        r = parseInt(rgbValues[0]);
                        g = parseInt(rgbValues[1]);
                        b = parseInt(rgbValues[2]);
                        colorKey = `${r}_${g}_${b}`;
                    }
                }
            } else if (color && typeof color === 'object') {
                // Handle p5.js color objects
                if (color.levels && Array.isArray(color.levels)) {
                    // p5.js stores color components in the levels array [r,g,b,a]
                    r = color.levels[0];
                    g = color.levels[1];
                    b = color.levels[2];
                    colorKey = `${r}_${g}_${b}`;
                } else {
                    // Try various methods to extract color
                    try {
                        // Use p5.js functions if available in this context
                        r = window.red ? window.red(color) : (color._array ? color._array[0] * 255 : 200);
                        g = window.green ? window.green(color) : (color._array ? color._array[1] * 255 : 200);
                        b = window.blue ? window.blue(color) : (color._array ? color._array[2] * 255 : 200);
                        r = Math.round(r);
                        g = Math.round(g);
                        b = Math.round(b);
                        colorKey = `${r}_${g}_${b}`;
                    } catch (e) {
                        console.error("Error extracting color:", e);
                        r = 200; g = 200; b = 200;
                        colorKey = "200_200_200";
                    }
                }
            } else {
                // Default color if extraction fails
                r = 200; g = 200; b = 200;
                colorKey = "200_200_200";
            }
            
            // Ensure valid RGB values
            r = Math.min(255, Math.max(0, Math.round(r || 0)));
            g = Math.min(255, Math.max(0, Math.round(g || 0)));
            b = Math.min(255, Math.max(0, Math.round(b || 0)));
            
            // Create a material for this color if it doesn't exist
            if (!uniqueColors[colorKey]) {
                // Create a descriptive material name compatible with Rhino
                const matName = `mat_${r}_${g}_${b}`;
                uniqueColors[colorKey] = { r, g, b, matName };
                materialNames[colorKey] = matName;
                
                // Normalize RGB values to 0-1 range for MTL
                const rn = (r/255).toFixed(6);
                const gn = (g/255).toFixed(6);
                const bn = (b/255).toFixed(6);
                
                // Add material definition to MTL file - optimized for Rhino compatibility
                mtlLines.push(`newmtl ${matName}`);
                
                // For Rhino compatibility, include all properties in proper order
                mtlLines.push(`Ka ${(r/255 * 0.8).toFixed(6)} ${(g/255 * 0.8).toFixed(6)} ${(b/255 * 0.8).toFixed(6)}`);
                mtlLines.push(`Kd ${rn} ${gn} ${bn}`);
                mtlLines.push(`Ks 0.7 0.7 0.7`); // Higher specular for more visibility
                mtlLines.push(`Ns 50.0`); // Higher shininess
                mtlLines.push(`d 1.0`); // Fully opaque
                // Use illumination model 2 which includes specular highlights
                mtlLines.push(`illum 2`);
                mtlLines.push(``); // Empty line between materials
            }
        });
        
        console.log(`Created ${Object.keys(uniqueColors).length} unique materials for Rhino compatibility`);
        
        // Define all normal vectors first - Rhino tends to handle this better
        objLines.push(`# Normal vectors`);
        objLines.push(`vn 0.000000 0.000000 -1.000000`); // front (-z) - normal index 1
        objLines.push(`vn 0.000000 0.000000 1.000000`);  // back (+z) - normal index 2
        objLines.push(`vn -1.000000 0.000000 0.000000`); // left (-x) - normal index 3
        objLines.push(`vn 1.000000 0.000000 0.000000`);  // right (+x) - normal index 4
        objLines.push(`vn 0.000000 -1.000000 0.000000`); // bottom (-y) - normal index 5
        objLines.push(`vn 0.000000 1.000000 0.000000`);  // top (+y) - normal index 6
        objLines.push(``);
        
        // Group voxels by material to reduce material switches, which helps Rhino
        const voxelsByMaterial = {};
        
        // First pass - organize voxels by material
        state.voxels.forEach(voxel => {
            const { color } = voxel;
            let r, g, b;
            
            if (typeof color === 'string') {
                if (color.startsWith('#')) {
                    r = parseInt(color.slice(1, 3), 16);
                    g = parseInt(color.slice(3, 5), 16);
                    b = parseInt(color.slice(5, 7), 16);
                } else if (color.startsWith('rgb')) {
                    const rgbValues = color.match(/\d+/g);
                    if (rgbValues && rgbValues.length >= 3) {
                        r = parseInt(rgbValues[0]);
                        g = parseInt(rgbValues[1]);
                        b = parseInt(rgbValues[2]);
                    }
                }
            } else if (color && typeof color === 'object') {
                if (color.levels && Array.isArray(color.levels)) {
                    r = color.levels[0];
                    g = color.levels[1];
                    b = color.levels[2];
                } else {
                    try {
                        r = window.red ? window.red(color) : (color._array ? color._array[0] * 255 : 200);
                        g = window.green ? window.green(color) : (color._array ? color._array[1] * 255 : 200);
                        b = window.blue ? window.blue(color) : (color._array ? color._array[2] * 255 : 200);
                        r = Math.round(r);
                        g = Math.round(g);
                        b = Math.round(b);
                    } catch (e) {
                        r = 200; g = 200; b = 200;
                    }
                }
            } else {
                r = 200; g = 200; b = 200;
            }
            
            r = Math.min(255, Math.max(0, Math.round(r || 0)));
            g = Math.min(255, Math.max(0, Math.round(g || 0)));
            b = Math.min(255, Math.max(0, Math.round(b || 0)));
            
            const colorKey = `${r}_${g}_${b}`;
            const matName = materialNames[colorKey];
            
            if (!voxelsByMaterial[matName]) {
                voxelsByMaterial[matName] = [];
            }
            
            voxelsByMaterial[matName].push(voxel);
        });
        
        // Now define all vertices first before faces - Rhino parses this better
        let vertexIndex = 1;
        const voxelVertices = {};
        
        // Generate all vertices first
        for (const voxel of state.voxels) {
            const { x, y, z } = voxel;
            const s = state.voxelSize / 2;
            
            // Define 8 vertices of the cube
            const vertices = [
                [x - s, y - s, z - s],  // 0: front bottom left
                [x + s, y - s, z - s],  // 1: front bottom right
                [x + s, y + s, z - s],  // 2: front top right
                [x - s, y + s, z - s],  // 3: front top left
                [x - s, y - s, z + s],  // 4: back bottom left
                [x + s, y - s, z + s],  // 5: back bottom right
                [x + s, y + s, z + s],  // 6: back top right
                [x - s, y + s, z + s]   // 7: back top left
            ];
            
            // Record the starting index of this voxel's vertices
            voxelVertices[`${x}_${y}_${z}`] = vertexIndex;
            
            // Add vertices to OBJ
            for (const v of vertices) {
                objLines.push(`v ${v[0].toFixed(6)} ${v[1].toFixed(6)} ${v[2].toFixed(6)}`);
            }
            
            vertexIndex += 8;
        }
        
        objLines.push(``);
        
        // Now output faces by material group
        for (const matName in voxelsByMaterial) {
            // Create a material group
            objLines.push(`g material_group_${matName}`);
            objLines.push(`usemtl ${matName}`);
            
            const voxelsInGroup = voxelsByMaterial[matName];
            
            // Process all voxels in this material group
            for (const voxel of voxelsInGroup) {
                const { x, y, z } = voxel;
                const vertexOffset = voxelVertices[`${x}_${y}_${z}`];
                
                // Individual voxel grouping
                objLines.push(`g voxel_${x}_${y}_${z}`);
                
                // Define faces with vertex normals (optimized for Rhino)
                const faces = [
                    // Front face (-z) - normal index 1
                    [`${vertexOffset}//${1}`, `${vertexOffset + 1}//${1}`, `${vertexOffset + 2}//${1}`],
                    [`${vertexOffset}//${1}`, `${vertexOffset + 2}//${1}`, `${vertexOffset + 3}//${1}`],
                    
                    // Back face (+z) - normal index 2
                    [`${vertexOffset + 5}//${2}`, `${vertexOffset + 4}//${2}`, `${vertexOffset + 7}//${2}`],
                    [`${vertexOffset + 5}//${2}`, `${vertexOffset + 7}//${2}`, `${vertexOffset + 6}//${2}`],
                    
                    // Left face (-x) - normal index 3
                    [`${vertexOffset + 4}//${3}`, `${vertexOffset}//${3}`, `${vertexOffset + 3}//${3}`],
                    [`${vertexOffset + 4}//${3}`, `${vertexOffset + 3}//${3}`, `${vertexOffset + 7}//${3}`],
                    
                    // Right face (+x) - normal index 4
                    [`${vertexOffset + 1}//${4}`, `${vertexOffset + 5}//${4}`, `${vertexOffset + 6}//${4}`],
                    [`${vertexOffset + 1}//${4}`, `${vertexOffset + 6}//${4}`, `${vertexOffset + 2}//${4}`],
                    
                    // Bottom face (-y) - normal index 5
                    [`${vertexOffset}//${5}`, `${vertexOffset + 4}//${5}`, `${vertexOffset + 5}//${5}`],
                    [`${vertexOffset}//${5}`, `${vertexOffset + 5}//${5}`, `${vertexOffset + 1}//${5}`],
                    
                    // Top face (+y) - normal index 6
                    [`${vertexOffset + 3}//${6}`, `${vertexOffset + 2}//${6}`, `${vertexOffset + 6}//${6}`],
                    [`${vertexOffset + 3}//${6}`, `${vertexOffset + 6}//${6}`, `${vertexOffset + 7}//${6}`]
                ];
                
                // Add faces to OBJ
                for (const face of faces) {
                    objLines.push(`f ${face[0]} ${face[1]} ${face[2]}`);
                }
            }
            
            // Add separator between material groups
            objLines.push(``);
        }
        
        // Create a special visibility indicator file for Rhino
        const visLines = [];
        visLines.push(`# Visibility helper for Rhino`);
        visLines.push(`# This file helps ensure materials are visible in Rhino`);
        visLines.push(`# Place both .obj and .mtl files in the same directory`);
        visLines.push(`# Then import the .obj file with "Import Materials" checked`);
        
        const visFilename = `${filename}_import_instructions.txt`;
        const visBlob = new Blob([visLines.join('\n')], { type: 'text/plain' });
        const visUrl = URL.createObjectURL(visBlob);
        
        // Convert to Blob and trigger download for OBJ
        const objContent = objLines.join('\n');
        const objBlob = new Blob([objContent], { type: 'text/plain' });
        const objUrl = URL.createObjectURL(objBlob);
        
        // Convert to Blob and trigger download for MTL
        const mtlContent = mtlLines.join('\n');
        const mtlBlob = new Blob([mtlContent], { type: 'text/plain' });
        const mtlUrl = URL.createObjectURL(mtlBlob);
        
        // Download all files
        const objLink = document.createElement('a');
        objLink.href = objUrl;
        objLink.download = `${filename}.obj`;
        objLink.style.display = 'none';
        document.body.appendChild(objLink);
        objLink.click();
        document.body.removeChild(objLink);
        URL.revokeObjectURL(objUrl);
        
        const mtlLink = document.createElement('a');
        mtlLink.href = mtlUrl;
        mtlLink.download = mtlFilename;
        mtlLink.style.display = 'none';
        document.body.appendChild(mtlLink);
        mtlLink.click();
        document.body.removeChild(mtlLink);
        URL.revokeObjectURL(mtlUrl);
        
        const visLink = document.createElement('a');
        visLink.href = visUrl;
        visLink.download = visFilename;
        visLink.style.display = 'none';
        document.body.appendChild(visLink);
        visLink.click();
        document.body.removeChild(visLink);
        URL.revokeObjectURL(visUrl);
        
        console.log("OBJ+MTL export completed successfully with enhanced Rhino compatibility!");
        alert(`Export complete! Downloaded:\n- ${filename}.obj\n- ${mtlFilename}\n- ${visFilename}\n\nThese files work together - keep them in the same folder when importing to Rhino.\nIMPORTANT: When importing to Rhino, be sure to check "Import Materials" in the import options.`);
    } catch (error) {
        console.error("Error exporting to OBJ+MTL:", error);
        alert("Error exporting to OBJ+MTL: " + error.message);
    }
}

// Expose functions to global scope for the button click handlers
window.exportToOBJ = exportToOBJ;
window.exportToOBJWithMTL = exportToOBJWithMTL;