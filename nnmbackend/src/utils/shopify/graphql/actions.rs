use std::collections::HashMap;

use super::{traits::GraphQLRepresentable, types::ShopifyGraphQLType};

#[derive(Debug, Clone, PartialEq, Eq, serde::Deserialize, serde::Serialize)]
pub enum GraphQLAction {
    Query,
    Mutation(Option<String>)
}

#[derive(Debug, Clone)]
pub struct GraphQLQuery<T: GraphQLRepresentable> {
    pub action: GraphQLAction,
    pub query: T,
    pub variables: HashMap<String, ShopifyGraphQLType>
}

impl<T: GraphQLRepresentable> GraphQLQuery<T> {
    pub fn new(action: GraphQLAction, query: T, variables: HashMap<String, ShopifyGraphQLType>) -> Self {
        Self {
            action,
            query,
            variables
        }
    }

    pub fn query(qobj: T) -> Self {
        Self {
            action: GraphQLAction::Query,
            query: qobj,
            variables: HashMap::new()
        }
    }

    pub fn mutation(qobj: T, name: Option<String>) -> Self {
        Self {
            action: GraphQLAction::Mutation(name),
            query: qobj,
            variables: HashMap::new()
        }
    }

    pub fn add_variable(&mut self, key: String, value: ShopifyGraphQLType) {
        self.variables.insert(key, value);
    }

    fn get_fmt_variables(&self) -> String {
        // Format as JSON object
        let mut s = String::new();
        s.push_str("{");
        if self.variables.is_empty() {
            s.push_str("}");
            return s;
        }
        for (key, value) in self.variables.iter() {
            match value {
                ShopifyGraphQLType::ID(v) => s.push_str(&format!("\"{}\": \"{}\", ", key, v)),
                ShopifyGraphQLType::String(v) => s.push_str(&format!("\"{}\": \"{}\", ", key, v)),
                ShopifyGraphQLType::Boolean(v) => s.push_str(&format!("\"{}\": {}, ", key, v)),
                ShopifyGraphQLType::Int(v) => s.push_str(&format!("\"{}\": {}, ", key, v)),
                ShopifyGraphQLType::Float(v) => s.push_str(&format!("\"{}\": {}, ", key, v)),
                ShopifyGraphQLType::JSON(v) => s.push_str(&format!("\"{}\": {}, ", key, v)),
                ShopifyGraphQLType::Array(v) => {
                    s.push_str(&format!("\"{}\": [", key));
                    for item in v {
                        s.push_str(&format!("{}, ", item.to_value_string()));
                    }
                    if s.ends_with(", ") {
                        s.pop();
                        s.pop();
                    }
                    s.push_str("], ");
                },
                ShopifyGraphQLType::Object(v) => s.push_str(&format!("\"{}\": {}, ", key, v.iter().map(|(k, v)| format!("\"{}\": {}", k, v.to_value_string())).collect::<Vec<String>>().join(", "))),  // Recursively format object
                ShopifyGraphQLType::Custom(_, underlying) => s.push_str(&format!("\"{}\": {}, ", key, underlying.to_value_string()))
            }
        }
        if s.ends_with(", ") {
            s.pop();
            s.pop();
        }
        s.push_str("}");
        s
    }

    pub fn to_payload(&self) -> String {
        format!("{{\"query\":\"{}\", \"variables\": {}}}", self.to_graphql(self.variables.clone()), self.get_fmt_variables())
    }
}

impl<T: GraphQLRepresentable> GraphQLQuery<T> {
    pub fn query_to_graphql(&self, args: HashMap<String, ShopifyGraphQLType>) -> Option<String> {
        if self.action != GraphQLAction::Query {
            return None;
        }

        let mut query = String::new();
        query.push_str("query");
        if !self.variables.is_empty() {
            query.push_str(" (");
            for (key, value) in self.variables.iter() {
                query.push_str(&format!("${}: {}, ", key, value.to_string()));
            }
            if query.ends_with(", ") {
                query.pop();
                query.pop();
            }
            query.push_str(")");
        }
        query.push_str(" {\n");
        if self.variables.contains_key(self.query.label().as_str()) {
            let subargs = args.get(self.query.label().as_str()).unwrap();
            query.push_str(self.query.to_graphql(subargs.clone().to_object(&self.query.label()).clone()).as_str());
        } else {
            query.push_str(self.query.to_graphql(args).as_str());
        }
        query.push_str("\n}");
        Some(query)
    }

    pub fn mutation_to_graphql(&self) -> Option<String> {
        let mut query = String::new();
        query.push_str("mutation");
        
        if !self.variables.is_empty() {
            query.push_str(" (");
            for (key, value) in self.variables.iter() {
                query.push_str(&format!("${}: {}, ", key, value.to_string()));
            }
            if query.ends_with(", ") {
                query.pop();
                query.pop();
            }
            query.push_str(")");
        }
        query.push_str(" {\n");
        if self.action != GraphQLAction::Mutation(None) {
            query.push_str(" ");
            let name = match &self.action {
                GraphQLAction::Mutation(Some(name)) => name,
                _ => return None
            };
            query.push_str(&name);
        }
        if !self.variables.is_empty() {
            query.push_str("(");
            for (key, _) in self.variables.iter() {
                query.push_str(&format!("{}: ${}, ", key, key));
            }
            if query.ends_with(", ") {
                query.pop();
                query.pop();
            }
            query.push_str(")");
        }
        
        query.push_str(" {\n");
        query.push_str(self.query.to_graphql(HashMap::new()).as_str());
        query.push_str("\n}");
        query.push_str("\n}");
        Some(query)
    }
}

impl<T: GraphQLRepresentable> GraphQLRepresentable for GraphQLQuery<T> {
    fn label(&self) -> String {
        match self {
            GraphQLQuery { action: GraphQLAction::Query, .. } => self.query.label(),
            GraphQLQuery { action: GraphQLAction::Mutation(Some(name)), .. } => name.clone(),
            GraphQLQuery { action: GraphQLAction::Mutation(None), .. } => "mutation".to_string()
        }
    }

    fn to_graphql(&self, args: HashMap<String, ShopifyGraphQLType>) -> String {
        match &self.action {
            GraphQLAction::Query => return self.query_to_graphql(args).unwrap_or(String::new()),
            GraphQLAction::Mutation(_) => return self.mutation_to_graphql().unwrap_or(String::new())
        }
    }
}
