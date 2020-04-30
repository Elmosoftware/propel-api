/**
 * Import and Export in this module all the models.
 */

import { User } from "./user";
import { Category } from "./category";
import { Group } from "./group";
import { Script } from "./script";
import { Target } from "./target";
import { Task } from "./task";
import { Workflow } from "./workflow";

export let allModels = [
    (new User()).getModel(),
    (new Category()).getModel(),
    (new Group()).getModel(),
    (new Script()).getModel(),
    (new Target()).getModel(),
    (new Task()).getModel(),
    (new Workflow()).getModel()
];