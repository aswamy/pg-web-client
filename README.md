# Introduction

This is a light weight browser-based PostgreSQL client made using LitElement and lit-html.

Currently only functional in Chromium-based browsers.

# Features

List of [incomplete] features I would like the application to have to be useful.

Complete|Priority|Description
-|-|-
:heavy_check_mark:|A|Run raw SQL Queries + Display results
:heavy_check_mark:|A|Display SQL Functions in side panel
:heavy_check_mark:|A|Display SQL Tables in side panel
:heavy_check_mark:|A|Store and access history of SQL queries
:x:|A|Show all records for a SQL Table
:x:|A|Visualize Table and relations in a diagram
:heavy_check_mark:|A|Show meta-information about tables
:heavy_check_mark:|B|Show each constraint and how it relates to other tables in the meta-information page
:heavy_check_mark:|B|Allow user to open multiple SQL tabs
:x:|B|Paginate results of SQL queries
:x:|B|Set/Restore Backups
:heavy_check_mark:|B|Run SQL Queries using hotkeys
:x:|C|Connect to multiple databases
:heavy_check_mark:|C|Download SQL Query to desktop

# Developer Goals

A list of items I would like to do to make it fun for me (as the developer) :D

- Develop an web application without using a full framework like Angular, React, or Vue.js
- Use Polymer projects to build web components
- Minify assets using Webpack
- Use Babel to allow better compatibility with older browsers (currently only works with a newer version of Chrome)
- Use a diagramming library to make interesting visuals for tables and their relations
- Make a native application using Electron (or something similar)
- Only build required CSS components using Webpack and Sass loader

# Development

```
npm ci
npm start
```

Open `localhost:3000`

NOTE: The credentials for the database are hard-coded at the moment (in `connection_service.js`). The example database and data can be found in the `examples` directory.
