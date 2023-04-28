const fs = require('fs');
const path = require('path');

var _db_dir = path.resolve(__dirname, '..', '..', '..', '..', '_db');

var storage_dir = path.resolve(__dirname, '..', '..', '..', '..', 'storage');
var certificados_dir = path.resolve(__dirname, '..', '..', '..', '..', 'storage','certificados');
var excel_download_dir = path.resolve(__dirname, '..', '..', '..', '..', 'storage','excel_download');
var ged_folder_dir = path.resolve(__dirname, '..', '..', '..', '..', 'storage','ged_folder');
var ged_folder_old_dir = path.resolve(__dirname, '..', '..', '..', '..', 'storage','ged_folder_old_dir');
var uploads_dir = path.resolve(__dirname, '..', '..', '..', '..', 'storage','uploads');
var uploads_dir_formidable_temp = path.resolve(__dirname, '..', '..', 'workers', 'formidable', 'temp');

if (!fs.existsSync(_db_dir)){
    fs.mkdirSync(_db_dir, { recursive: true });
}
if (!fs.existsSync(storage_dir)){
    fs.mkdirSync(storage_dir, { recursive: true });
}
if (!fs.existsSync(certificados_dir)){
    fs.mkdirSync(certificados_dir, { recursive: true });
}
if (!fs.existsSync(excel_download_dir)){
    fs.mkdirSync(excel_download_dir, { recursive: true });
}
if (!fs.existsSync(ged_folder_dir)){
    fs.mkdirSync(ged_folder_dir, { recursive: true });
}
if (!fs.existsSync(ged_folder_old_dir)){
    fs.mkdirSync(ged_folder_old_dir, { recursive: true });
}
if (!fs.existsSync(uploads_dir)){
    fs.mkdirSync(uploads_dir, { recursive: true });
}

if (!fs.existsSync(uploads_dir)){
    fs.mkdirSync(uploads_dir, { recursive: true });
}

if(!fs.existsSync(uploads_dir_formidable_temp)){
    fs.mkdirSync(uploads_dir_formidable_temp, { recursive: true });    
}else{
    fs.rmSync(uploads_dir_formidable_temp, { recursive: true, force: true });
    fs.mkdirSync(uploads_dir_formidable_temp, { recursive: true }); 
}