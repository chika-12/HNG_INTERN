const { genderData }= require('../services/genderizeService');

exports.classifyController = async(req, res) =>{
    try {
        const {name} = req.query;
        // input error checks

        if (!name || name.trim() === ""){
            return res.status(400).json({
                status: 'error',
                message: "Name parameter is required"
            })
        }
        if (typeof name != 'string'){
            return res.status(422).json({
                status: 'error',
                message: 'Name must be a string'
            })
        }
        //Api call
        const response = await genderData(name)
        //Output error checks
        if (!response.gender  || response.count === 0){
            return res.status(422).json({
                status: 'error',
                message:'No prediction available for the provided name'
            })
        }
        const probability = response.probability;
        const sample_size = response.count;
        const is_confident = probability >= 0.7 && sample_size >= 100;
        const processed_at = new Date().toISOString();

        return res.status(200).json({
            status: "success",
            data: {
                name: response.name,
                gender: response.gender,
                probability,
                sample_size,
                is_confident,
                processed_at
            }
        });
    }catch(error){
        return res.status(502).json({
            status:'error',
            'message': 'Failed to fetch data from external API'
        });
    }
};