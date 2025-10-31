import axios from 'axios'

const baseURL = 'https://api.cloudinary.com/v1_1/';
const upload_preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const api_key = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
console.log('upload_preset', upload_preset);
console.log('api_key', api_key);

const api = axios.create({
  baseURL: baseURL + process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + '/image/upload',
  timeout: 3600
})

const uploadImage = async (file: any) => {
    if ( typeof upload_preset === 'undefined' || typeof api_key === 'undefined' ) {
        throw new Error('Cloudinary API Key or Upload Preset not defined');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', upload_preset);
    formData.append('api_key', api_key);
    const res = await api.post('', formData);
    
    return res.data;
}    

export default uploadImage;