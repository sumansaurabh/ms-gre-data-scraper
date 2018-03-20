import requests
from bs4 import BeautifulSoup

gradcafe_url = "https://www.thegradcafe.com/survey/index.php"
# ?q=computer+science&t=a&o=&p=1


def getDecision(decision_tag):
	print("########    checkpoint 4 decision tag -->")
	
	decision = decision_tag.find_all('span')
	if len(decision) == 0:
		print("!!!!!! Very bad thing happend !!!!!!")
		return None

	print("########    checkpoint 5 decision tag -->", decision)
	decision_type = decision[0].string
	if decision_type == None or decision_type == "":
		return None
	print("########    checkpoint 6 decision tag --> ", decision_type)

	if(len(decision) == 1):
		return [decision_type, {
			"GPA" : "",
			"QUANT" : "",
			"VERBAL" : "",
			"AWA" : ""
		}]
	score_dat = str(decision[1])
	print("########    checkpoint 7 decision tag --> ", score_dat)
	
	rex = '>:(.*?)<'
	import re
	regex_exp = re.compile(rex)
	gpa, gre_general, gre_subject = regex_exp.findall(score_dat)
	print("########    checkpoint 8 decision tag -->")

	# print("GPA --> ",gpa, " :gre general --> ",gre_general, " :gre subject ", gre_general)
	gre_verbal, gre_quant, gre_awa = gre_general.split("/")



	return [decision_type, {
		"GPA" : gpa.strip(),
		"QUANT" : gre_quant.strip(),
		"VERBAL" : gre_verbal.strip(),
		"AWA" : gre_awa.strip()
	}]


def parse_date(date_tag):
	import datetime
	month_map = {
		"Jan" : '1',
		"Feb" : '2',
		"Mar" : '3',
		"Apr" : '4',
		"May" : '5',
		"Jun" : '6',
		"Jul" : '7',
		"Aug" : '8',
		"Sep" : '9',
		"Oct" : '10',
		"Nov" : '11',
		"Dec" : '12',
	}
	date = date_tag.string
	x = date.split()
	print("date tag --> ", x)
	dd, mm, yy = date.split()
	mm = month_map[mm]

	cur_date = int(datetime.datetime.strptime(dd+'/'+mm+'/'+yy, '%d/%m/%Y').strftime("%s"))

	return [cur_date, date]

def parse_notes(notes_tag):
	all_notes = []
	for itm in notes_tag.find_all('li'):
		notes_itm = itm.string
		if notes_itm == '' or notes_itm == None:
			pass
		else:
			all_notes.append(notes_itm)

	return all_notes


	


def fetch_page(page_no, search_key):
	import httplib2, re
	fetch_url = gradcafe_url+"?q="+search_key+"&t=a&o=&p="+str(page_no)
	# fetch_url = "http://127.0.0.1:8080/g1.html"
	http = httplib2.Http()
	headers, body = http.request(fetch_url)


	soup = BeautifulSoup(body)
	
	college_list = []

	tr_tag = soup.find_all("tr")

	for itm in tr_tag[1:]:

		td_tag = itm.find_all("td")

		insitute = td_tag[0].string
		program = td_tag[1].string

		decision = getDecision(td_tag[2])

		if decision == None:
			continue

		print("########### error 4")
		st = td_tag[3]
		timestamp_added, date_added = parse_date(td_tag[4])
		notes_added = parse_notes(td_tag[5])

		print(insitute, " --> st: ", st, " date added => ", decision)

		college_list.append({
			"institute" : insitute,
			"program" : program,
			"decision_type" : decision[0],
			"marks" : decision[1],
			"timestamp" : timestamp_added,
			"date": date_added,
			"notes_added": notes_added
		})
	print("##########3 Exiting loop #######")
	return college_list



def get_all_pages(page_limit, search_key):
	print("--------> ", page_limit)
	if page_limit > 15:
		page_limit = 15
	
	all_college_list = []
	for i in range(1, int(page_limit)+1):
		all_college_list += fetch_page(i, search_key)


	return all_college_list
		
