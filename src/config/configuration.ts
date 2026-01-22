export const configuration = () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
    },
    exchangeRates: {
        appId: process.env.OPEN_EXCHANGE_RATES_APP_ID,
    },
});
