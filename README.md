# Restaurants Search Engine
Is a API to search for the currently opened restaurants and to return a list of it. Each restaurant has an opening and closing hours. So user can request the currently opened restaurant at any time of the day.

using NodeJs 7.0.0 and Express Framework & ElasticSearch 5.5

# Installation
1-Clone the repository.

2-Place it in apache html directory for linux users.

3-Go to root directory of repo and run "npm install".

4-Check ElasticSearch server configuration in config.js file and make sure that is running.

5-Run "node server.js" this command will import csv file into ES cluster and also start node server.

6-Open your browser and access repo code ex: http://localhost/restaurants_search_engine-master .  

7-Now you can search using **AutoComplete input search** OR **Search button that will redirect you to JSON API version**.
 
# Search JSON API
You can visit it by http://localhost:8081/search or as discuss above.
By Passing 3 optional parameters to filter your restaurants search result :-

**word** => name of restaurant (Arabic | English).

**page** => (Pagination) to determine which page to display.

**time** => you can pass time as parameter if it not exist it will show results according to time now.
syntax of time parameter must be with format "HH:mm" like [ 13:30 - 23:16 - 10:00 - 1:30 ] in 24-hours system

**EX:**

http://localhost:8081/search?word=elmenus&page=2&time=23:15

# Files and Directories hierarchy

dataset -> source of restaurants.csv.

libs -> include business logic libraries

-- csvParser -> load csv file and mapping it objects key to be ready for indexing on elasticSearch
-- elasticCon  -> include implementation of all elasticSearch function like create/delete Indexes, sync csv object with elasticSearch

server.js -> main file

config.js -> define all constants of app