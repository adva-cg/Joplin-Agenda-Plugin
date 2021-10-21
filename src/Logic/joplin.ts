import joplin from "api";
import { groupBy } from "./misc"

/** getTodos ****************************************************************************************************************************************
 * Returns the list of uncompleted todos sorted by due date                                                                                         *
 ***************************************************************************************************************************************************/
export async function getTodos(){
    var allTodos = [];
    let pageNum = 0;
    do {
        var response = await joplin.data.get(['notes'], { fields: ['id', 'title', 'is_todo', 'todo_completed', 'todo_due'], page: pageNum++})
        allTodos = allTodos.concat(response.items)
    } while (response.has_more)
    var filteredTodos = allTodos.filter((todo, _index, _array) => (todo.is_todo == 1  && todo.todo_completed == 0 && todo.todo_due != 0))
    var sortedTodos = filteredTodos.sort((n1,n2) => n1.todo_due - n2.todo_due)
    var todoArray = groupBy(sortedTodos, (todo) => todo.todo_due != 0 ? (new Date(todo.todo_due)).toDateString() : "No Due Date")
    return todoArray
}

/** openTodo ****************************************************************************************************************************************
 * Opens the note with the given ID                                                                                                                 *
 ***************************************************************************************************************************************************/
export async function openTodo(todoID: string){
    await joplin.commands.execute('openNote', todoID);
}

/** toggleTodoCompletion ****************************************************************************************************************************
 * Toggles the todo completion state                                                                                                                *
 ***************************************************************************************************************************************************/
export async function toggleToDoCompletion(noteID: string){
    var note = await joplin.data.get(['notes', noteID], {fields: ['todo_completed']});
    var newCompletedValue = note.todo_completed == 0 ? 1: 0 
    await joplin.data.put(['notes', noteID], null, { todo_completed: newCompletedValue});
}

/** setupTaskChangeHandler **************************************************************************************************************************
 * Creates a polling function that runs a callback whenever a task changes                                                                          *
 ***************************************************************************************************************************************************/
export async function setupTaskChangeHandler(callback){
    var cursor = null
    async function processChanges(){
        do {
            var response = await joplin.data.get(['events'], { fields: ['id', 'item_type', 'item_id', 'type', 'created_time'], cursor: cursor})
            for (var item of response.items) { 
                callback(item) 
            }
            cursor = response.cursor
        } while (response.has_more)    
    }
    setInterval(processChanges, 500)
}