# Propel Changelog
All notable changes to this project will be documented in this file.
 
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).
 
## [2.3.0] - 8/28/2024
 
### Added
- Workflow Schedules.
- System Jobs.
- App Pool usage monitoring.
 
### Changed
- Minimal upgrades: 
  - Mongo DB v7.0.12
  - Node.js v20.16.0 LTS.

### Fixed

- Errors in Propel API do not display enough info.
- Closing Electron APP window or browser whith a running Workflow that retrieves 
lot of data cause the API to hang.


## [2.2.0] - 3/14/2024
 
### Added
- Simplified login.
- Runtime parameters.
- Database credentials.
 
### Changed
- Upgrading to 
  - Mongo DB v7.0.
  - Angular v16.0.
  - Node.js v20.11.1 LTS.

### Fixed

- Not expiring user sessions.
- Incorrect number validation in Workflow Steps.
- Empty credentials for $PropelCredentials when editing steps.
- Incorrect default value for String parameters when editing steps.


## [2.1.0] - 8/4/2023
 
### Added
- Credential of type API Key.
- New "Type" attribute for credentials.
- Custom Help message for $PropelCredentials.
- Increased maximim of targets per Workflow step.
- Standard user authentication procedures
- Create and manage Users
- Securing the frontend and backend endpoints. 
- Legacy security mode.
- Preserve usr session when the app is closing

### Changed
- Category attribute for Scripts and Workflows shows no utility so far. It was removed.
- Group attribute for Targets was removed.
- Better error treatment for both Frontend and backend.
- New Navigation bar
- Improved search
- Removed deprecated APIResponse class.
- Upgrading to 
  - Mongo DB v5.0.3.
  - Angular v14.0.

### Fixed
- Exception during script execution when Credentials includes double quotes.
- Populate schema issue that prevents populate data fro a child ref when it has no children
- Dataguard prevents Home redirection when token can't be refreshed.
- Closing the app during a Workflow execution aborts the execution.
- Workflow executions hangs when the workflow was deleted.

## [2.0.0] - 10/1/2021
 
### Added
- Encryption capabilities to Database collections.
- Propel Credentials and new $PropelCredentials parameter for scripts to access them.
- New landing page including Usage stats, latest executed workflows, latest errors in Workflows, etc.
- Role based access to the database.

### Changed
- 
- Upgrading to 
  - Mongo DB v4.4.
  - Angular v12.2.
  - Node.js v14.17.6 LTS.

### Fixed
- Quick Task unhandled exception when invoking targets that have a credential associated.

