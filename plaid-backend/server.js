const express = require('express');
const cors = require("cors")
const bodyParser = require("body-parser")

const app = express();
app.use(cors())
app.use(bodyParser.json())

const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid')

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': '64e8381af9159700114be435',
      'PLAID-SECRET': '80c5e320c698f5cb2b7a8f397c8fad',
    },
  },
});

const plaidClient = new PlaidApi(configuration);

app.post("/hello", (request, response) => {
    let name = "Dylan"
    response.json({message: "hello " + name})
})

app.post('/create_link_token', async function (request, response) {
    // Get the client_user_id by searching for the current user
    const plaidRequest = {
      user: {
        // This should correspond to a unique id for the current user.
        client_user_id: 'user',
      },
      client_name: 'Plaid Test App',
      products: ['auth', 'transactions'],
      language: 'en',
      redirect_uri: 'http://localhost:3000/',
      country_codes: ['US'],
    };
    try {
      const createTokenResponse = await plaidClient.linkTokenCreate(plaidRequest);
      response.json(createTokenResponse.data);
    } catch (error) {
      response.status(500).send("failure")
    }
  });

  app.post('/exchange_public_token', async function (
    request,
    response,
    next,
  ) {
    const publicToken = request.body.public_token;
    try {
      const plaidResponse = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });
  
      // These values should be saved to a persistent database and
      // associated with the currently signed-in user
      const accessToken = plaidResponse.data.access_token;
  
      response.json({accessToken});
    } catch (error) {
      response.status(500).send("failed")
    }
  });

  app.post("/transactions/get", async function(request, response) {
    try {
        const access_token = request.body.access_token
        const plaidRequest = {
            access_token: access_token,
            start_date: '2018-01-01',
            end_date: '2020-02-01',
            options: {
              include_personal_finance_category: true
            }
          };
            const plaidResponse = await plaidClient.transactionsGet(plaidRequest);
            response.json(plaidResponse.data)
        } catch (e) {
            response.status(500).send("failed")
        }
  })


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
