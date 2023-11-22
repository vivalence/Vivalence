import { graphql } from "$houdini";

export const _houdini_load = graphql(`
    query CurriculumsRead {
        curriculumsRead {
            id
            name
            gameRelations {
                id
                game {
                    id
                    type
                    typePretty
                }
            }
        }
    }
`);
