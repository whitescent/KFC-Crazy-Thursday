const axios = require('axios').default;
export default function handler(request, response) {
    axios
        .get('https://raw.githubusercontent.com/Nthily/KFC-Crazy-Thursday/main/kfc.json')
        .then(res => {
            var json = res.data;
            response.status(200).send(json[Math.floor(Math.random() * json.length)].text);
        })
}
