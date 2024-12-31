export const OpenaiFileUpload= {
    name: 'FileUpload',
    type: 'response',
    match: ({ trace }) =>
        trace.type === 'openai_fileUpload' || trace.payload.name === 'openai_fileUpload',
    render: ({ trace, element }) => {
        const { openaiKey } = trace.payload;
        console.log(openaiKey);
  
        const fileUploadContainer = document.createElement('div');
        fileUploadContainer.innerHTML = `
            <style>
                .my-file-upload {
                    border: 2px dashed rgba(46, 110, 225, 0.3);
                    padding: 20px;
                    text-align: center;
                    cursor: pointer;
                }
            </style>
            <div class='my-file-upload'>Drag and drop a file here or click to upload</div>
            <input type='file' style='display: none;'>
        `;
  
        const fileInput = fileUploadContainer.querySelector('input[type=file]');
        const fileUploadBox = fileUploadContainer.querySelector('.my-file-upload');
  
        fileUploadBox.addEventListener('click', function () {
            fileInput.click();
        });
  
        fileInput.addEventListener('change', function () {
            const file = fileInput.files[0];
            console.log('File selected:', file);
  
            fileUploadContainer.innerHTML = `<img src="https://s3.amazonaws.com/com.voiceflow.studio/share/upload/upload.gif" alt="Upload" width="50" height="50">`;
  
            const data = new FormData();
            data.append('file', file);
            data.append('purpose', 'assistants');
  
            const fileType = file.type.startsWith('image/') ? 'image' : 'document';
  console.log("file_type: "+ fileType)
            fetch('https://api.openai.com/v1/files', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${openaiKey}`,
                },
                body: data,
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Upload failed: ' + response.statusText);
                    }
                })
                .then((result) => {
                    fileUploadContainer.innerHTML =
                        '<img src="https://s3.amazonaws.com/com.voiceflow.studio/share/check/check.gif" alt="Done" width="50" height="50">';
                    console.log('File uploaded:', result.id);
                    window.voiceflow.chat.interact({
                        type: 'complete',
                        payload: {
                            file: result.id,
                            type: fileType,
                        },
                    });
                })
                .catch((error) => {
                    console.error(error);
                    fileUploadContainer.innerHTML = '<div>Error during upload</div>';
                });
        });
  
        element.appendChild(fileUploadContainer);
    },
  }