"use strict";
const fs = require("fs-extra");
const Handlebars = require("handlebars");
const pathUtils = require("path");
const fileUtils = module.exports = fs;

fileUtils.deleteDirectory = (path)=>{
    return new Promise((resolve,reject)=>{
        fs.rmdir(path,(err)=>{
            if (error) {
                reject(error);
            }
            else{
                resolve();
            }
        });
    });
};
fileUtils.ensureDirectory = (path)=> {
    return new Promise((resolve,reject)=>{
        fs.ensureDir(path,(err)=>{
            if(err){
                reject(err);
            }
            else{
                resolve();
            }
        });
    });
};
fileUtils.isDirectory = (path)=> {
    return fileUtils._testPath(path)
        .then((result)=>{
            if(result && result.type === 'directory'){
                return Promise.resolve(true);
            }
            else{
                return Promise.reject(new Error(path+" is not a directory."));
            }
        });
};
fileUtils.isFile = (path)=> {
    return fileUtils._testPath(path)
        .then((result)=>{
            if(result && result.type === 'file'){
                return Promise.resolve(true);
            }
            else{
                return Promise.reject(new Error(path+" is not a file."));
            }
        });
};
fileUtils.isSymbolicLink = (path)=> {
    return fileUtils._testPath(path)
        .then((result)=>{
            if(result && result.type === 'link'){
                return Promise.resolve(true);
            }
            else{
                return Promise.reject(new Error(path+" is not a link."));
            }
        });
};
fileUtils._testPath = (path)=> {
    return new Promise((resolve,reject)=>{
        fs.lstat(path,(err, stats)=>{
            if(err){
                //err.code === "ENOENT" //no such file or directory
                reject(err);
            }
            else{
                if(stats.isSymbolicLink()){
                    resolve({
                        path: path,
                        type: 'link'
                    });
                }
                else if(stats.isDirectory()){
                    resolve({
                        path: path,
                        type: 'directory'
                    });
                }
                else if(stats.isFile()){
                    resolve({
                        path: path,
                        type: 'file'
                    });
                }
                else{
                    reject(new Error(path+" is not a directory, file, or symbolic link."));
                }
            }
        });
    });
};
fileUtils.readFileContents = (path)=>{
    return new Promise((resolve,reject)=>{
        fs.readFile(path,'utf8',(err,data)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(data);
            }
        });
    });
};
fileUtils.writeContentsToFile = (path, contents, mode)=>{
    return Promise.resolve()
        .then(()=>{
            let parentDir = pathUtils.dirname(path);
            return fileUtils.ensureDirectory(parentDir);
        })
        .then(()=>{
            return new Promise((resolve,reject)=>{
                fs.writeFile(path, contents, {encoding: 'utf8', mode: mode}, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else{
                        resolve();
                    }
                });
            });
        });
};
fileUtils.renderTemplate = (path, templateData)=>{
    return Promise.resolve()
        .then(()=>{
            return fileUtils.readFileContents(path);
        })
        .then((data)=>{
            let templateFn = Handlebars.compile(data);
            let rendered = templateFn(templateData);
            return rendered;
        });
};
fileUtils.writeTemplate = (path, templateData, dest, mode)=>{
    return Promise.resolve()
        .then(()=>{
            return fileUtils.readFileContents(path);
        })
        .then((data)=>{
            let templateFn = Handlebars.compile(data);
            let rendered = templateFn(templateData);
            return rendered;
        })
        .then((rendered)=>{
            return fileUtils.writeContentsToFile(dest,rendered,mode);
        });
};