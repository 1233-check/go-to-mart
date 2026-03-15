import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

const DIRECTORY = path.join('C:', 'Users', 'Shashank Chauhan', 'Downloads', 'go to mart');

// Helper to handle the image parsing for Gemini
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType: mimeType
    },
  };
}

async function renameImages() {
  const files = fs.readdirSync(DIRECTORY).filter(file => file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.png'));
  console.log(`Found ${files.length} images to process.`);
  for (const file of files) {
    const filePath = path.join(DIRECTORY, file);
    
    // Check if the file is already renamed properly (doesn't start with WhatsApp or _)
    if (!file.startsWith('WhatsApp') && !file.startsWith('_')) {
      console.log(`Skipping ${file} - already seems named.`);
      continue;
    }

    try {
      const mimeType = 'image/jpeg';
      const promptText = `Identify the exact product shown in this image. Give me ONLY the clean product name as a string suitable for a filename (alphanumeric, spaces, dashes). Do not include weight or size. Example: "Lays Classic Potato Chips" or "Kelloggs Corn Flakes". Just output the string, nothing else.`;

      const requestBody = {
        contents: [{
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: mimeType,
                data: Buffer.from(fs.readFileSync(filePath)).toString("base64")
              }
            }
          ]
        }]
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.VITE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        console.error("API Response payload:", JSON.stringify(data, null, 2));
        throw new Error("No response from Gemini API");
      }
      
      let productName = data.candidates[0].content.parts[0].text.trim();
      
      // Clean up the name for file system safety
      productName = productName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, ' ');

      if (productName) {
        // Construct new filename
        const ext = path.extname(file);
        let newFileName = `${productName}${ext}`;
        let newFilePath = path.join(DIRECTORY, newFileName);

        // Handle duplicates
        let counter = 1;
        while (fs.existsSync(newFilePath)) {
           newFileName = `${productName} (${counter})${ext}`;
           newFilePath = path.join(DIRECTORY, newFileName);
           counter++;
        }

        fs.renameSync(filePath, newFilePath);
        console.log(`✅ Renamed: "${file}" -> "${newFileName}"`);
      } else {
         console.log(`❌ Could not identify product in: ${file}`);
      }
      
      // Wait a moment to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
  
  console.log('\\n🎉 All files processed!');
}

renameImages();
