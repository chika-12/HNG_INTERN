const axios = require('axios');

exports.genderData= async (name) => {
    try {
        const response = await axios.get(`https://api.genderize.io?name=${name}`, {timeout: 5000});
        return response.data;
    } catch (error) {
        console.error('Error fetching gender data:', error);
        throw error;
    } 
};
