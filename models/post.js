var mongodb = require('./db');
var crypto = require('crypto');

function Post(name, title,category,categoryaliase, post) {
  this.username = name;
  this.title= title;
  this.categoryaliase = categoryaliase;
  this.category = category;
  this.post = post;
}

module.exports = Post;

Post.prototype.save = function(callback) {//存储一篇文章及其相关信息
  var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth()+1),
      day : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
  }

  var timestamp = Date.parse(date).toString();

  var md5 = crypto.createHash('md5');
  timestamp = md5.update(timestamp).digest('hex');

  var category = {
    name:this.category,
    aliase: this.categoryaliase
  }
  //要存入数据库的文档
  var post = {
      username: this.username,
      time: time,
      title:this.title,
      category: category,
      post: this.post,
      timestamp: timestamp
  };
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //将文档插入 posts 集合
      collection.insert(post, {
        safe: true
      }, function (err,post) {
        mongodb.close();
        callback(null);
      });
    });
  });
};

Post.prototype.update = function(timestamp, callback){
  var category = {
    name:this.category,
    aliase: this.categoryaliase
  }
  var post = {
      username: this.username,
      title:this.title,
      category:category,
      post: this.post
  };
  mongodb.open(function (err,db){
    if(err){
      return callback(err);
    }

    db.collection('posts', function (err, collection){
      if (err) {
        mongodb.close();
        return callback(err);
      }

      collection.update({'timestamp':timestamp},{$set:post},function(err,result) {
        mongodb.close();
        callback(null);
      });
    });

  });

};

Post.get = function(timestamp, callback) {//读取文章及其相关信息
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err,null);
    }
    //读取 posts 集合
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err,null);
      }
      var query = {};
      if (timestamp) {
        query.timestamp = timestamp;
      }
      //根据 query 对象查询文章
      collection.find(query).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);//失败！返回 null
        }
        callback(null, docs);//成功！以数组形式返回查询的结果
      });
    });
  });
};