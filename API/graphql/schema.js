const {buildSchema} = require('graphql');


exports.schema = buildSchema(`
    type TestData {
        text: String!
        views: Int!
    }
    
    type RootQuery {
        hello: TestData!
    }
    
    schema {
        query: RootQuery
    }
`)