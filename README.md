# CRE8IVE

Offline, Opensource, Digital Canvas for everyone.

![Demo](https://user-images.githubusercontent.com/129486620/229494648-a2b04bcb-291f-4cd1-93de-32e5c033609c.png)

**Default user:**

```
email: admin@example.com
password: &uMRhy5^FqytdQ9Z%uzU
```

⚠️ **Please note:** The CRE8IVE application is still under development, and there is no stable version available yet. CRE8IVE uses [Pocketbase](https://github.com/pocketbase/pocketbase) for its backend, which is also under active development and does not have a stable version. Currently, backward compatibility is not guaranteed. CRE8IVE does not send your data to any server. All your data is stored in your local machine inside the `pb_data` folder. If you make any changes to the database schema or the application source, there is a higher chance that your local CRE8IVE app might break and it may not be able to upgrade to the future versions. If you want to make any such changes or experiment on your local machine, I suggest creating an independent folder and run a separate application instance in that folder.

# Demo
https://user-images.githubusercontent.com/129486620/229493694-3e10396b-f893-4828-889c-246e0b309008.mp4

# How to run the application?
1. Download latest version of the application from [release page](https://github.com/cre8ive-app/cre8ive/releases)
1. Extract the package
1. Open terminal
1. Run below commands
    - `cd <path-to-cre8ive-in-your-machine>`
        - Windows: `./cre8ive.exe serve`
        - Mac/Linux: `./cre8ive serve`

If you see below output then the application is running successfully.
```
Server started at http://127.0.0.1:8090
➜ REST API: http://127.0.0.1:8090/api/
➜ Admin UI: http://127.0.0.1:8090/_/
```

Go to your browser and enter `http://127.0.0.1:8090` in the address bar.

# FAQ

## Where does CRE8IVE save my data?
CRE8IVE is using [Pocketbase](https://github.com/pocketbase/pocketbase) backend which is shipped with the application. Pocketbase uses `SQLite` database. All your data is saved in your local machine inside `pb_data` folder.

## How can I backup my data?
Take a backup of `pb_data` folder which will have all your data.

## How to upgrade CRE8IVE to new version?
1. Backup current app folder
1. Delete `pb_migrations`, `pb_public` and `cre8ive` (if windows: `cre8ive.exe`) (**Note:** DO NOT DELETE `pb_data` folder)
1. Download latest version of the application from [release page](https://github.com/cre8ive-app/cre8ive/releases)
1. Extract the package. Copy `pb_migrations`, `pb_public`, `cre8ive` and paste into your app folder

## Why CRE8IVE app size is 40+ MB?
CRE8IVE app size is just around 3.4MB, remaining size is due to Pocketbase backend which is used as a database for the application.

## How to access app database?
Run the application and from your browser visit
```
http://127.0.0.1:8090/_/
```
Use app user credentials to login.

⚠️ **Please note:** If you make any changes to the database schema or the application source, there is a higher chance that your local CRE8IVE app might break and it may not be able to upgrade to the future versions. If you want to make any such changes or experiment on your local machine, I suggest creating an independent folder and running a separate application instance in that folder.

# Roadmap
- Autosave
- Lazyload cards
- Copy cards from one canvas to another
- Export
- Support different media types like Video and Audio
- Undo and Redo card changes
- Card index
- Handle error cases and display message
- Create Spaces
