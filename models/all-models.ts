/**
 * Import and Export in this module all the models.
 */

import { User } from "./user";
import { Tag } from "./tag";
import { Category } from "./category";
import { Script } from "./script";

export let allModels = [
    (new User()).getModel(),
    (new Tag()).getModel(),
    (new Category()).getModel(),
    (new Script()).getModel()
];