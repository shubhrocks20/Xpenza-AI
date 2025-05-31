import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

const API_KEY = process.env.TABSCANNER_API_KEY;
const BASE_URL = process.env.TABSCANNER_BASE_URL;

async function callProcess(filePath: string, params: Record<string, any> = {}) {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath)); 

        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value);
        });

        console.log('FORMDATA:', formData);

        const response = await axios.post(`${BASE_URL}/2/process`, formData, {
            headers: { 'apikey': API_KEY, ...formData.getHeaders() },
        });

        return response.data;
    } catch (error: any) {
        console.error('Error in callProcess:', error.message);
        throw error;
    }
}
export async function callResult(token: string) {
    try {
        const response = await axios.get(`${BASE_URL}/result/${token}`, {
            headers: { 'apikey': API_KEY },
        });
        

        return response.data;
    } catch (error: any) {
        console.log('Error is: ', error)
        console.error('Error in callResult:', error.message);
        throw error;
    }
}
export async function processAndFetchResult(imageFile: string) {
    try {
        console.log('Image File:', imageFile);

        const processResult = await callProcess(imageFile);
        console.log('RESULT : ', processResult)
        const token = processResult?.token;
        if (!token) throw new Error('Failed to retrieve token from process call.');

        console.log('Token:', token);

        let retries = 5;
        while (retries > 0) {
            const result = await callResult(token);
            if (result?.status === 'done') {
                console.log('Processing completed:', result);
                return result;
            }
            console.log(`Processing not completed. Retrying... (${retries} attempts left)`);
            retries--;
            await new Promise(res => setTimeout(res, 5000)); // Wait before retrying
        }

        throw new Error('Processing timeout: Result not available.');
    } catch (error: any) {
        console.error('Error in processAndFetchResult:', error.message);
    }
    finally{
        fs.unlinkSync(imageFile);
    }
}