import axios from "axios";

export default async function createOrUpdateWebhook(asaas_account_api_key: string, email: string) {
    const { data } = await axios.get(`${process.env.ASAAS_API_URL}/webhooks`,{
        headers: {
          access_token: asaas_account_api_key
        }
    });

    console.log(data.data);

    if(data.data.length === 0 ){
        await axios.post(`${process.env.ASAAS_API_URL}/webhooks`, {
            name: 'charges',
            url: process.env.WEBHOOK_URL,
            email,
            sendType: 'SEQUENTIALLY',
            events: ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'PAYMENT_AUTHORIZED'],
            enabled: true,
            interrupted: false,
        }, {
            headers: {
              access_token: asaas_account_api_key
            }
        });
    }else{
        await axios.put(`${process.env.ASAAS_API_URL}/webhooks/${data.data[0].id}`, {
            name: 'charges',
            url: process.env.WEBHOOK_URL,
            email,
            sendType: 'SEQUENTIALLY',
            events: ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'PAYMENT_AUTHORIZED'],
            enabled: true,
            interrupted: false,
        }, {
            headers: {
              access_token: asaas_account_api_key
            }
        });
    }

}