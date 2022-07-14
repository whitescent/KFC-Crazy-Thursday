const axios = require('axios').default;
export default function handler(request, response) {
    var json = [];
    axios
        .get('https://raw.githubusercontent.com/Nthily/KFC-Crazy-Thursday/main/kfc.json')
        .then(res => {
            json = res.data;
        })
    response.status(200).send(json[Math.random()*json.length]);
}
