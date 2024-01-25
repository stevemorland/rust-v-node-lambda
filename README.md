# rust-v-node-lambda

## First build the rust binary

1. `cd basic-endpoint`
2. `cargo build`
3. `cargo lambda build --release`

You will now have a `target` folder containing a `lambda/basic-endpoint`

## Deploy the Infra

1. `cd infra`
2. `yarn`
3. `yarn cdk --profile YOUR-PROFILE`

This will deploy an API Gateway with two endpoints `/node` and `/rust`.

These endpoints invoke their respective Lambda functions.
