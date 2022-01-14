import { Profile } from "../../logic/models/profile";
import { runQuery } from "./common";

/** createTable *************************************************************************************************************************************
 * Creates the database table if it doesnt exist                                                                                                    *
 ***************************************************************************************************************************************************/
export async function createTable(){
    var createQuery = `
        CREATE TABLE IF NOT EXISTS Profile (
            id INTEGER PRIMARY KEY,
            name TEXT,
            searchCriteria TEXT,
            noteID TEXT,
            showCompleted BOOLEAN,
            showNoDue BOOLEAN,
            displayFormat TEXT,
            yearFormat TEXT,
            monthFormat TEXT,
            dayFormat TEXT,
            weekdayFormat TEXT,
            timeIs12Hour TEXT
        )
    `
    await runQuery('run', createQuery, {})
}

/** createRecord ************************************************************************************************************************************
 * Creates a new recurrence record in the recurrence database when given the noteID and recurrence data object.                                     *
 ***************************************************************************************************************************************************/
export async function createRecord(profile=new Profile()){
    await runQuery('run', `INSERT INTO Profile DEFAULT VALUES`, {})
    var id = await getLastRowID()
    await updateRecord(id, profile);
    return id
}

async function getLastRowID(){
    return (await runQuery("get", " SELECT LAST_INSERT_ROWID()", {}))['LAST_INSERT_ROWID()']
}

/** getAllRecords ***********************************************************************************************************************************
 * Gets all records from the database                                                                                                               *
 ***************************************************************************************************************************************************/
export async function getAllRecords(){
    var records = await runQuery('all', `SELECT * FROM Profile`, {})
    var allProfiles = {}
    for (var record of records){
        allProfiles[record.id] = getRecordAsProfile(record)
    }
    return allProfiles
}

/** getRecord ***************************************************************************************************************************************
 * Gets recurrence record from the database for the corresponding note ID                                                                           *
 ***************************************************************************************************************************************************/
export async function getRecord(id){
    var record = await runQuery('get', `SELECT * FROM Profile WHERE id = $id`, {$id: id})
    return getRecordAsProfile(record)
}

/** UpdateRecord ************************************************************************************************************************************
 * This is a helper function that updates a recurrence record in the database when given the noteID and recurrence data object                      *
 ***************************************************************************************************************************************************/
export async function updateRecord(id, profile){
    var updateQuery = `
        UPDATE Profile
        SET
            name = $name,
            searchCriteria = $searchCriteria,
            noteID = $noteID,
            showCompleted = $showCompleted,
            showNoDue = $showNoDue,
            displayFormat = $displayFormat,
            yearFormat = $yearFormat,
            monthFormat = $monthFormat,
            dayFormat = $dayFormat,
            weekdayFormat = $weekdayFormat,
            timeIs12Hour = $timeIs12Hour
        WHERE id = $id
    `
    var updateParameters = {
        $id: id,
        $name: profile.name,
        $searchCriteria: profile.searchCriteria,
        $noteID: profile.noteID,
        $showCompleted: profile.showCompleted,
        $showNoDue: profile.showNoDue,
        $displayFormat: profile.displayFormat,
        $yearFormat: profile.yearFormat,
        $monthFormat: profile.monthFormat,
        $dayFormat: profile.dayFormat,
        $weekdayFormat: profile.weekdayFormat,
        $timeIs12Hour: profile.timeIs12Hour
    }
    console.log(id)
    console.log(profile)
    await runQuery('run', updateQuery, updateParameters)
}

/** deleteRecord ************************************************************************************************************************************
 * This is a helper function that deletes a record from the database for the corresponding ID.                                                      *
 ***************************************************************************************************************************************************/
export async function deleteRecord(id){
    await runQuery('run', `DELETE FROM Profile WHERE id = $id`, {$id: id})
}

/** getRecordAsProfile ******************************************************************************************************************************
 * Converts a database record from an sqlite3 output to an agenda profile object                                                                    *
 ***************************************************************************************************************************************************/
function getRecordAsProfile(record): Profile{
    if (record != undefined){
        var profile = new Profile()
        profile.name = record.name
        profile.searchCriteria = record.searchCriteria
        profile.noteID = record.noteID
        profile.showCompleted = record.showCompleted
        profile.showNoDue = record.showNoDue
        profile.displayFormat = record.displayFormat
        profile.yearFormat = record.yearFormat
        profile.monthFormat = record.monthFormat
        profile.dayFormat = record.dayFormat
        profile.weekdayFormat = record.weekdayFormat
        profile.timeIs12Hour = record.timeIs12Hour
        return profile
    }
}
