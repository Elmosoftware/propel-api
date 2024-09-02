# Propel Product Backlog
Not a real product Backlog here, but just a way to note on some interesting ideas for the future that were not included in the last version.

## OPEN BUGS

### No save buttons visible after changing a step order in the Workflows step form
Both "Save" & "Save & Run" still hidden after changing the order of the steps in the edith steps form.
This is a minor issue, because the buttons are visible with any other change.

### Some navigation issues for User with role user.
Sometimes when a user with role "User" is navigating from home page using the links in the home page 
cards and those links are unauthorized, the navigation back to the home page is not working properly.

## NEW FEATURES

### Replace Quick Task by Script Running
The option “Quick Task” must be removed and replaced by a “Run” button at the side of each script.

### Scripts usage.
This is about to display in which workflows each script is been used. Natural candidate to show this information is the “Browse scripts” and in the Script form itself.

### Credential Usage
This is about to display in which workflows each credential is been used. Natural candidate to show this information is the “Browse Workflows” and in the Script form itself.

### Adding Schedule information in Browse Workflows
In the list of Workflows in search page it will be good to add the schedule information in similar way as we do in the History page.

### Export execution results.
Allows the users to export the execution results.

### Release What's new popup
Show a popup dialog every new Propel release to each user until get’s closed. We must show in the popup the new features of the release.

### Deprecate/Remove Legacy Security mode
Regular auth must be the only way for Propel Phase I. 
BE AWARE: Legacy mode is also the only option to add users in a new Propel installation. So it can't just be removed without adding some alternative.

### In progress tasks
It will be good to see in some way all the QuickTasks/Workflows that are in progress before they finish.
Maybe this could be a replacement for the actual run page and show a page with all what is running with the option to dive into the execution and see what the current script running is writing in the standard output. 

### Database cleanup
Add as a System Job a cleanup process of the database. In order to do this, it will be required a thoughtful design to delete everything that is already soft deleted but also is not referenced anymore.
A quick win for example: Workflows that are Quick Tasks and they have more than 30 days old.

Others to consider:
    - Scripts, Targets or Credentials deleted and not referenced in any Quicktask/worflow not deleted.
    - etc...

### Upgrade to Electron latest version
This implies also to migrate from electron-builder to the new Electron forge.