var fs = require("./fs.js");
var path = require("path");
var slice = Array.prototype.slice;

var dir = function(u, data){
	data = data || [];
	u = path.resolve(u);
	return fs.readdir(u).then(function(items){
		return items.reduce(function(chain, item){
			return chain.then(function(data){
				return fs.stat(u + "/" + item).then(function(stat){
					if(stat.isDirectory()){
						return dir(u + "/" + item, data);
					}
					else{
						if(/\.(html?|js|css)$/i.test(item)){
							data.push(u + "/" + item);
						}
						return data;
					}
				})
			});
		}, Promise.resolve(data));
	});
};

var re_api = /\.googleapis\.com\//i;
dir("./").then(function(files){
	return files.reduce(function(chain, file){
		return chain.then(function(data){
			return fs.readFile(file).then(function(content){
				content = content.toString("utf8");
				if(re_api.test(content)){
					return fs.writeFile(file, content.replace(re_api, ".useso.com/")).then(function(){
						data.push(file);
						console.log(data.length, files.length);
					});
				}
				return data;
			})
		});
	}, Promise.resolve([]))
});
