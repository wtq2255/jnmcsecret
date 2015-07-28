# coding: UTF-8
import os
import tornado.web
import tornado.template
from tornado.httpclient import AsyncHTTPClient
from tornado.database import Connection
import sae
import urlparse
import hashlib
from bs4 import BeautifulSoup
import sae.const
import time, datetime
import threading
import sae.storage
import urllib
import Cookie 
import random 
import datetime 
import hashlib
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

#App token for Auth
TOKEN = "383a553sv8s8027SU1";

app_root = os.path.dirname(__file__)

#DATABASE
db_settings = {
    "host": sae.const.MYSQL_HOST,
    "db": sae.const.MYSQL_DB,
    "port": sae.const.MYSQL_PORT,
    "user": sae.const.MYSQL_USER,
    "password": sae.const.MYSQL_PASS,
}


class BaseHandler(tornado.web.RequestHandler):
    
    @property
    def db(self):
        treehole_db = Connection(
            host=db_settings["host"] + ":" + db_settings["port"], database=db_settings["db"],
            user=db_settings["user"], password=db_settings["password"])
        return treehole_db
    def get_current_user(self):
        return self.get_secure_cookie("token")
    def check_admin(self):
       if not self.current_user:
           return False
       else:
           tokens = self.db.query("SELECT * FROM jnmc_admin")
           for token in tokens:
               if self.current_user == token.token:
                   return True
               else:
                   return False
    
    



#Wechar Message Model
class Message(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        WEsignature = self.get_argument("signature")
        WEtimestamp = self.get_argument("timestamp")
        WEnonce = self.get_argument("nonce")
        WEechostr = self.get_argument("echostr")
        #Sort By Dictionary order
        SortedData = sorted([TOKEN,WEtimestamp,WEnonce])
        SortedString = SortedData[0] + SortedData[1] + SortedData[2]
        #Encode By Sha1
        EncodeString = hashlib.sha1(SortedString).hexdigest()
        self.set_header("Content-Type", "text/plain")
        if EncodeString == WEsignature:
            self.write(WEechostr)
        else:
            self.write("Auth false")
            
    @tornado.web.asynchronous
    def post(self,link):
        if self.authlink():
            data = self.request.body
            message = BeautifulSoup(data)
            #Parse Message
            msg_to_user = message.tousername.text
            msg_from_user = message.fromusername.text
            msg_created_at = float(message.createtime.text)
            msg_type = message.msgtype.text
            reply_time = int(time.time())
            self.set_header("Content-Type", "text/xml")
            if msg_type == 'text':
                msg_id = message.msgid
                msg_content = message.content.text
                if msg_content.strip() == "1" or msg_content.strip().lower() == "news":
                    return self.response_news(msg_from_user,msg_to_user)
                elif msg_content.strip() == "2" or msg_content.strip().lower() == "jobs" :
                    return self.response_jobs(msg_from_user,msg_to_user)
                elif msg_content.strip() == "3" or msg_content.strip().lower() == "express" :
                    return self.response_express(msg_from_user,msg_to_user)
                elif msg_content.strip() == "4" or msg_content.strip().lower() == "find" :
                    return self.response_find(msg_from_user,msg_to_user)
                elif self.search_biaobai(msg_content):
                    self.db.execute("""
                              INSERT INTO jnmc_express (msg_to_user,msg_from_user,msg_created_at,msg_content,storey
                              ) VALUES (%s,%s,%s,%s,%s)
                              """, msg_to_user, msg_from_user, datetime.datetime.fromtimestamp(msg_created_at), msg_content, "1")
                    reply_content = "树洞收到你的表白消息啦，快发送 3 到表白墙看看吧～ 查看更多功能请回复 help 。"
                    self.render("reply.xml", to_user_name = msg_from_user, msg_from_user = msg_to_user, created_time = reply_time,
                              content = reply_content)
                elif self.search_xunwuqishi(msg_content):
                    self.db.execute("""
                              INSERT INTO jnmc_find (msg_to_user,msg_from_user,msg_created_at,msg_content
                              ) VALUES (%s,%s,%s,%s)
                              """, msg_to_user, msg_from_user, datetime.datetime.fromtimestamp(msg_created_at), msg_content)
                    reply_content = "树洞收到你的寻物启事了，快发送 4 看看有没有人回应吧～ 更多功能请回复 help 。"
                    self.render("reply.xml", to_user_name = msg_from_user, msg_from_user = msg_to_user, created_time = reply_time,
                              content = reply_content)
                elif msg_content.strip().lower() == "help":
                    reply_content = "直接回复：推送实时消息 \n\n回复“表白+内容”：推送表白情书 \n\n回复“寻物启事+内容”：推送寻物启事 \n\n回复1：返回树洞里的新鲜事 \n\n回复2：返回树洞里的招聘信息 \n\n回复3：返回树洞里的表白墙 \n\n回复4：返回树洞里的寻物启事"
                    self.render("reply.xml", to_user_name = msg_from_user, msg_from_user = msg_to_user, created_time = reply_time,
                              content = reply_content)

                else:
                  self.db.execute("""
                              INSERT INTO jnmc_message (msg_to_user,msg_from_user,msg_created_at,msg_type,msg_id,msg_content,msg_img_url
                              ) VALUES (%s,%s,%s,%s,%s,%s,%s)
                              """, msg_to_user, msg_from_user, datetime.datetime.fromtimestamp(msg_created_at), msg_type, msg_id, msg_content, "none")
                  reply_content = "树洞收到你的消息啦!你可以回复 1 查看最新消息，查看更多功能请回复 help 。"
                  self.render("reply.xml", to_user_name = msg_from_user, msg_from_user = msg_to_user, created_time = reply_time,
                              content = reply_content)

            elif msg_type == 'event':
                if message.event.text == "subscribe":
                    reply_content = "欢迎订阅济医树洞，直接回复消息即可诉说自己小秘密（会匿名的哟），回复 1 可以查看他人小秘密， 查看更多功能请回复 help 。"
                    self.render("reply.xml", to_user_name = msg_from_user, msg_from_user = msg_to_user, created_time = reply_time,
                                content = reply_content)
            elif msg_type == 'image':
                msg_id = message.msgid
                msg_img_url = message.picurl.text
                #Save image
                file = urllib.urlopen(msg_img_url).read()
                s = sae.storage.Client()
                ob = sae.storage.Object(file)
                filename = str(msg_id) + '.jpg'
                new_url = s.put('img', filename , ob)
                self.db.execute("""
                            INSERT INTO jnmc_message (msg_to_user,msg_from_user,msg_created_at,msg_type,msg_id,msg_img_url,msg_content
                            ) VALUES (%s,%s,%s,%s,%s,%s,%s)
                            """, msg_to_user, msg_from_user, datetime.datetime.fromtimestamp(msg_created_at), msg_type, msg_id, new_url,"none")
                reply_content = "树洞收到你的图片啦!你可以回复 1 查看最新消息哟。查看更多功能请回复 help 。"
                self.render("reply.xml", to_user_name = msg_from_user, msg_from_user = msg_to_user, created_time = reply_time,
                            content = reply_content)
            elif msg_type == 'voice':
                msg_id = message.msgid
                mediaid = message.mediaid.text
                media_format = message.format.text
                reply_content = "又是语音消息啊，好吧，但是现在还不支持噢。但是，你可以回复 1 查看最新的消息哟。查看更多功能请回复 help 。"
                self.render("reply.xml", to_user_name = msg_from_user, msg_from_user = msg_to_user, created_time = reply_time,
                            content = reply_content)
            else:
                reply_content = "你所发的信息格式目前还不支持噢，树洞正在努力成长中。你可以回复 1 查看最新消息，查看更多功能请回复 help 。"
                self.render("reply.xml", to_user_name = msg_from_user, msg_from_user = msg_to_user, created_time = reply_time,
                            content = reply_content)
        
    def authlink(self):
        WEsignature = self.get_argument("signature")
        WEtimestamp = self.get_argument("timestamp")
        WEnonce = self.get_argument("nonce")
        #Sort By Dictionary order
        SortedData = sorted([TOKEN,WEtimestamp,WEnonce])
        SortedString = SortedData[0] + SortedData[1] + SortedData[2]
        #Encode By Sha1
        EncodeString = hashlib.sha1(SortedString).hexdigest()
        if EncodeString == WEsignature:
            return True
        else:
            return False

    def response_news(self, msg_from_user = None, msg_to_user = None):
        self.set_header("Content-Type", "text/xml")
        title = reply_content = "树洞里的新鲜事"
        messages = self.db.query("SELECT * FROM jnmc_message ORDER BY created_at DESC LIMIT 5")
        num = 1
        reply_content += "\n\n"
        for message in messages:
            if message.msg_type == "text":
                reply_content += str(num) + ". " + message.msg_content.encode('utf-8') + "\n" + str(message.msg_created_at) + "\n\n"
                num += 1
        link = "http://jnmcsecret.sinaapp.com/article"
        reply_time = int(time.time())
        self.render("link.xml", to_user_name = msg_from_user, msg_from_user = msg_to_user, created_time = reply_time,
                    content = reply_content, title = title, link = link)

    def response_jobs(self, msg_from_user = None, msg_to_user = None):
        self.set_header("Content-Type", "text/xml")
        title = reply_content = "树洞里的招聘"
        jobs = self.db.query("SELECT * FROM jnmc_jobs ORDER BY created_at "
                                        "DESC LIMIT 5")
        num = 1
        reply_content += "\n\n"
        for job in jobs:
            reply_content += str(num) + ". " + job.title.encode('utf-8') + "\n" + str(job.created_at) + "\n\n"
            num += 1
            
        link = "http://jnmcsecret.sinaapp.com/jobs"
        reply_time = int(time.time())
        self.render("link.xml", to_user_name = msg_from_user, msg_from_user = msg_to_user, created_time = reply_time,
                    content = reply_content, title = title, link = link)

    def response_express(self, msg_from_user = None, msg_to_user = None):
        self.set_header("Content-Type", "text/xml")
        title = reply_content = "树洞里的表白墙"
        messages = self.db.query("SELECT * FROM jnmc_express ORDER BY created_at "
                                        "DESC LIMIT 5")
        num = 1
        reply_content += "\n\n"
        for message in messages:
            reply_content += str(num) + ". " + message.msg_content.encode('utf-8') + "\n" + str(message.msg_created_at) + "\n\n"
            num += 1
            
        link = "http://jnmcsecret.sinaapp.com/express"
        reply_time = int(time.time())
        self.render("link.xml", to_user_name = msg_from_user, msg_from_user = msg_to_user, created_time = reply_time,
                    content = reply_content, title = title, link = link)

    def response_find(self, msg_from_user = None, msg_to_user = None):
        self.set_header("Content-Type", "text/xml")
        title = reply_content = "树洞里的寻物启事"
        messages = self.db.query("SELECT * FROM jnmc_find ORDER BY created_at "
                                        "DESC LIMIT 5")
        num = 1
        reply_content += "\n\n"
        for message in messages:
            reply_content += str(num) + ". " + message.msg_content.encode('utf-8') + "\n" + str(message.msg_created_at) + "\n\n"
            num += 1
            
        link = "http://jnmcsecret.sinaapp.com/find"
        reply_time = int(time.time())
        self.render("link.xml", to_user_name = msg_from_user, msg_from_user = msg_to_user, created_time = reply_time,
                    content = reply_content, title = title, link = link)


    def search_biaobai(self,msg_contetn):
        if msg_contetn.find("表白",0,2) == 0 :
            return True
        else :
            return False

    def search_xunwuqishi(self,msg_contetn):
        if msg_contetn.find("寻物启事",0,4) == 0 :
            return True
        else :
            return False

#Index Model
class Article(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        messages = self.db.query("SELECT * FROM jnmc_message ORDER BY id "
                                        "DESC LIMIT 200")
        current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        self.render("article.html", messages = messages, time = current_time, title = '树洞里的新鲜事')

class Jobs(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        jobs = self.db.query("SELECT * FROM jnmc_jobs ORDER BY id "
                                        "DESC LIMIT 200")
        current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        self.render("jobs.html", jobs = jobs, time = current_time, title = '树洞里的招聘')

class Express(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        messages = self.db.query("SELECT * FROM jnmc_express ORDER BY id "
                                        "DESC LIMIT 200")
        current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        self.render("main.html", messages = messages, time = current_time, title = '树洞里的表白墙')

class Find(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        messages = self.db.query("SELECT * FROM jnmc_find ORDER BY id "
                                        "DESC LIMIT 200")
        current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        self.render("main.html", messages = messages, time = current_time, title = '树洞里的寻物启事')


#Admin Model

class Admin(BaseHandler):
    def get(self):
        if self.check_admin():
            self.render("admin.html")
        else:
            self.redirect("/login")
    def post(self):
        self.clear_cookie("token")
        self.redirect("/login")

class LoginCheck(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render("login.html")

    def post(self):
        username = self.get_argument("username")
        password = self.get_argument("password")
        md5password = hashlib.md5(password).hexdigest()
        users = self.db.query("SELECT * FROM jnmc_admin")
        for user in users:
            if username == user.username and md5password == user.password :
                cookietoken = random.randint(0,1000000000)
                self.set_secure_cookie("token", str(cookietoken), expires_days = self.checkloginkeeping())
                self.db.execute("UPDATE jnmc_admin SET token = %s", cookietoken)
                self.render("admin.html")
            else:
                self.write("username or password is wrong!")

    def checkloginkeeping(self):
        try:
            if self.get_argument("loginkeeping") == "loginkeeping":
                return 30
        except :
            return 0.01

class AdminArticle(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        if self.check_admin():
            messages = self.db.query("SELECT * FROM jnmc_message ORDER BY created_at DESC")
            current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            self.render("admin_article.html", messages = messages, time = current_time)
        else:
            self.redirect("/login")
    def post(self):
        msg_id = self.get_argument('msg_id')
        delete_content = "对不起，您来晚啦～～～此楼层已删除！ "
        delete_type = "text"
        self.db.execute("UPDATE jnmc_message SET msg_content = %s, msg_type = %s WHERE id = %s", delete_content, delete_type, msg_id)
        if self.check_admin():
            messages = self.db.query("SELECT * FROM jnmc_message ORDER BY created_at DESC")
            current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            self.render("admin_article.html", messages = messages, time = current_time)
        else:
            self.redirect("/login")

        

class JobsEntry(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        if self.check_admin():
            self.render("jobsentry.html")
        else:
            self.redirect("/login")

    def post(self):
        self.set_header("Content-Type", "text/html")
        title = self.get_argument("title")
        contacts = self.get_argument("contacts")
        tel= self.get_argument("telephone")
        content = self.get_argument("content")
        enquiry = self.get_argument("enquiry")
        detailedarea = self.get_argument("detailedarea")
        area = "山东省" + enquiry + detailedarea
        msg_created_at = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        self.db.execute("""
            INSERT INTO jnmc_jobs (title,contacts,tel,content,msg_created_at,area
                ) VALUES (%s,%s,%s,%s,%s,%s)
            """, title,contacts,tel,content,msg_created_at,area)
        self.render("jobsentrysuccess.html")

class AdminJobs(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        if self.check_admin():
            jobs = self.db.query("SELECT * FROM jnmc_jobs ORDER BY id DESC")
            current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            self.render("admin_jobs.html", jobs = jobs, time = current_time)
        else:
            self.redirect("/login")
    def post(self):
        job_id = self.get_argument('job_id')
        delete_content = "对不起，您来晚啦～～～此信息已删除！ "
        delete_null = ""
        self.db.execute("UPDATE jnmc_jobs SET content = %s, contacts = %s, tel = %s, area = %s WHERE id = %s", delete_content, delete_null, delete_null, delete_null, job_id)
        if self.check_admin():
            jobs = self.db.query("SELECT * FROM jnmc_jobs ORDER BY id DESC")
            current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            self.render("admin_jobs.html", jobs = jobs, time = current_time)
        else:
            self.redirect("/login")

class AdminExpress(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        if self.check_admin():
            messages = self.db.query("SELECT * FROM jnmc_express ORDER BY created_at DESC")
            current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            self.render("admin_main.html", messages = messages, time = current_time, action = "/adminexpress")
        else:
            self.redirect("/login")
    def post(self):
        msg_id = self.get_argument('msg_id')
        delete_content = "对不起，您来晚啦～～～此楼层已删除！ "
        self.db.execute("UPDATE jnmc_express SET msg_content = %s WHERE id = %s", delete_content, msg_id)
        if self.check_admin():
            messages = self.db.query("SELECT * FROM jnmc_express ORDER BY created_at DESC")
            current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            self.render("admin_main.html", messages = messages, time = current_time, action = "/adminexpress")
        else:
            self.redirect("/login")

class AdminFind(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        if self.check_admin():
            messages = self.db.query("SELECT * FROM jnmc_find ORDER BY created_at DESC")
            current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            self.render("admin_main.html", messages = messages, time = current_time, action = "/adminfind")
        else:
            self.redirect("/login")
    def post(self):
        msg_id = self.get_argument('msg_id')
        delete_content = "对不起，您来晚啦～～～此楼层已删除！ "
        self.db.execute("UPDATE jnmc_find SET msg_content = %s WHERE id = %s", delete_content, msg_id)
        if self.check_admin():
            messages = self.db.query("SELECT * FROM jnmc_find ORDER BY created_at DESC")
            current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            self.render("admin_main.html", messages = messages, time = current_time, action = "/adminfind")
        else:
            self.redirect("/login")


#Test Model
class Hello(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render("hello.html")






#Application setting
settings = {
    "debug": True,
    "sitename": "TreeHole",
    "template_path": os.path.join(os.path.dirname(__file__), "templates"),
    "static_path": os.path.join(os.path.dirname(__file__), "static"),
    "gzip" : True,
}

application = tornado.web.Application([
    (r"/", Hello),
    (r"/message/(.*)", Message),
    (r"/article", Article),
    (r"/jobs", Jobs),
    (r"/express", Express),
    (r"/find", Find),
    (r"/admin", Admin),
    (r"/jobsentry", JobsEntry),
    (r"/adminarticle", AdminArticle),
    (r"/adminjobs", AdminJobs),
    (r"/adminexpress", AdminExpress),
    (r"/adminfind", AdminFind),
    (r"/login", LoginCheck)
], cookie_secret="61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o/Vo=", **settings)
