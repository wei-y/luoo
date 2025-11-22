const ffmpeg = require('ffmpeg-static');
const { exec } = require('child_process');
const path = require('path');

const input = path.join(__dirname, '../docs/demo.webm');
const output = path.join(__dirname, '../docs/demo.gif');

// Scale to 800px width, 10fps, optimize palette
const cmd = `"${ffmpeg}" -y -i "${input}" -vf "fps=10,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${output}"`;

console.log('Running ffmpeg...');
exec(cmd, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    if (stderr) console.log(`ffmpeg stderr: ${stderr}`);
    console.log('GIF generated successfully!');
});
