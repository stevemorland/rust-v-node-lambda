# rust-v-node-lambda

## First, build the rust binary

1. `cd basic-endpoint`
2. `cargo build`
3. `cargo lambda build --release`

You will now have a `target` folder containing a `lambda/basic-endpoint`

## Repeat for the parse endpoint

1. `cd parse-endpoint`
2. `cargo build`
3. `cargo lambda build --release`

You will now have a `target` folder containing a `lambda/parse-endpoint`

## Deploy the Infra

1. `cd infra`
2. `yarn`
3. `yarn cdk --profile YOUR-PROFILE`

This will deploy an API Gateway with four endpoints `/node`, `/rust`, `/node-parsea`, `/rust-parse`.

These endpoints invoke their respective Lambda functions.
