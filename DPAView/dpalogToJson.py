import re, sys
import time, datetime
from datetime import date
import json

computerMap = {} 
userMap = {}
taskDict = {}
global month 
global year
lengthOfMonth = 0
def main():
	fileName = sys.argv[1]
	getDateInformation(fileName)
	try:
		inPointer = open(fileName, 'r')
		parseObj = parser(inPointer);


		#Parses until there are no more tasks
		while(True):
			line = parseObj.nextTask()
			if (line == False):
				break

			currentTask = parseObj.parseTask(line)
			
			if(currentTask != False):
				taskDict[currentTask.name] = currentTask
				computerName = currentTask.QMachine
				userName = currentTask.creator
				#if the computer is already in the dictionary, add the task to its list. else, create the computer
				if computerName not in computerMap:
					computerMap[computerName] = Computer(computerName)
				computerMap[computerName].addTask(currentTask)
				
				#same with users
				if userName not in userMap:
					print userName
					userMap[userName] = Computer(userName)
				userMap[userName].addTask(currentTask)
		inPointer.close()

		#Writing the file
		try:
	#		outPointer = open(fileName[:-4]+"Parsed.json", 'w')
	#		for i in computerMap:
	#			computerMap[i].update()
	#			outPointer.write(json.dumps(computerMap[i], default=lambda o: o.__dict__, indent = 2))


			tasksOut= open("taskLogs/" + fileName[:-4]+"_tasks.json", 'w')
			tasksOut.write(json.dumps(taskDict, default=lambda o: o.__dict__, indent = 2))
			usersOut= open("taskLogs/" + fileName[:-4]+"_users.json", 'w')
			usersOut.write(json.dumps(userMap, default=lambda o: o.__dict__, indent = 2))
			computersOut= open("taskLogs/" + fileName[:-4]+"_computers.json", 'w')
			computersOut.write(json.dumps(computerMap, default=lambda o: o.__dict__, indent = 2))

		
		except IOError:
			print "Could not write to " + fileName + " -- " + IOError

		#outPointer.close()
		tasksOut.close()
		usersOut.close()
		computersOut.close()
		
	except IOError:
		print "Could not open " + fileName

def getDateInformation(fileName):
	dateStr = fileName[:-4]
	month = int(dateStr[-2:])
	year = int(dateStr[:4])
	global lengthOfMonth
	lengthOfMonth = daysInMonth(month, year)

def daysInMonth(month, year):
	thirtyOneDays = [1, 3, 5, 7, 8, 10, 12]
	thirtyDays = [4, 6, 9, 11]
	for i in thirtyOneDays:
		if month == i:
			return 31;
	for i in thirtyDays:
		if month == i:
			return 30
	#leap year
	if month == 2 and year % 4 == 0:
		return 29
	return 28


def dayFromTimestamp(timestamp):
	newDate = date.fromtimestamp(timestamp)
	return newDate.day

def dateToTimeStamp(dateString):
	"""Converts a date string to a timestamp"""
	return time.mktime(datetime.datetime.strptime(dateString, "%Y-%m-%d_%H-%M-%S").timetuple())

##Used to organize data by time.
#class monthBin:
#	def __init__(self, startDate):
#		self.startTimeStamp = startDate
#		self.daysBin = []
#		
#
#	#determines what bin to put the task in
#	def sortTask(self):
#		stuff = True


class dayBin:
	#date of bin
	def __init__(self, dayOfMonth):
		self.dayOfMonth = dayOfMonth
		self.totalDelay = 0
		self.totalRunTime = 0
		self.secondsPerTask = 0
		self.delayPerTask = 0
		self.totalTasks = 0
		self.taskIDs= []
	#contains a list of task IDs performed this day
	#contains all summary information on tasks done this day
	def addTask(self, task):
		self.taskIDs.append(task.name)
		self.totalDelay += task.delay
		self.totalRunTime += task.runTime
		self.update()

	def update(self):
		self.totalTasks = len(self.taskIDs);
		self.secondsPerTask = float(self.totalRunTime) / float(self.totalTasks)
		self.delayPerTask = float(self.totalDelay) / float(self.totalTasks)


#class User:
#	def __init__(self, name):
#		self.name = name
#		self.totalRunTime = 0
#		self.secondsPerTask = 0
#		self.delayPerTask = 0

class Computer:
	def __init__(self, name):
		self.QName = 0
		self.hidden = False
		self.name = name
		self.dayBins = []
		self.totalTasks = 0
		self.totalDelay = 0
		self.totalRunTime = 0
		self.secondsPerTask = 0
		self.delayPerTask = 0
		for i in range(lengthOfMonth):
			dayTemp = dayBin(i)
			self.dayBins.append(dayTemp)
	def addTask(self, task):
		#floor task date into the proper bin
		dateIndex = dayFromTimestamp(task.creationDate)
		if self.QName == 0:
			self.QName = task.QName
		#dates start at 1, so subtact 1 to account for arrays starting at 0
		self.dayBins[dateIndex - 1].addTask(task)
		self.totalTasks += 1
		self.totalDelay += task.delay
		self.totalRunTime += task.runTime
		self.update()

	def update(self):
		self.secondsPerTask = float(self.totalRunTime) / float(self.totalTasks)
		self.delayPerTask = float(self.totalDelay) / float(self.totalTasks)

class Task:
	def __init__(self, name):
		self.name = name
		self.creator = ""
		self.QName = ""
		self.QMachine = ""
		self.creationDate = 0
		self.startTime = 0
		self.endTime = 0
		self.elapsedTime = 0
		self.runTime = 0
		self.delay = 0
		self.returnCode = 0

class parser:

	def __init__(self, filePointer):
		self.filePointer = filePointer
		self.taskIndex = 0
		self.currTask = 0

	def getFieldValue(self, field, line):
		"""Retrieves the value of the specified field for a particular task"""
		pattern = re.split(r'\x1b[^m]*m|\n', line);
		#print pattern
		count = 0
		for string in pattern:
			matchObj = re.search(field, string);
			if(matchObj):
				fieldValue = pattern[count+1]
				return fieldValue
			count += 1
		return False

	
	def parseTask(self, line):
		"""Parses all relevant information from the task currently pointed to by currTask. Returns a task object"""
		#stripping newlines and ascii escape codes (color) from the line
		taskID = self.getFieldValue('Task ID', line)
		newTask = Task(taskID)
	#	print taskID	
		#gathering all data relevant to the visualization
		line = self.filePointer.readline()
		newTask.creator = self.getFieldValue('Creator', line)

		line = self.filePointer.readline()
		creationDate = self.getFieldValue('Creation Date', line)
		newTask.creationDate = dateToTimeStamp(creationDate)

		line = self.filePointer.readline()
		#Task origin machine probably isn't important
		newTask.creationComputer = self.getFieldValue('Creation Machine', line)

		#jumping to the next relevant field
		for i in range(7):
			line = self.filePointer.readline()
		newTask.QName = self.getFieldValue('Queue Name', line)

		line = self.filePointer.readline()
		newTask.QMachine = self.getFieldValue('Queue Machine', line)
		if newTask.QMachine == '':
			return False

		line = self.filePointer.readline()
		line = self.filePointer.readline()
		startTime = self.getFieldValue('Start Time', line)
		if startTime == '' or type(startTime) == bool:
			return False
		newTask.startTime = dateToTimeStamp(startTime)

		#calculating the delay between the time the task enters the queue and the start of its execution
		newTask.delay = newTask.startTime - newTask.creationDate

		line = self.filePointer.readline()
		endTime = self.getFieldValue('End Time', line)
		if endTime == '':
			return False
		newTask.endTime = dateToTimeStamp(endTime)

		newTask.runTime = newTask.endTime - newTask.startTime 

		
		#jumping to the next relevant field
		for i in range(20):
			line = self.filePointer.readline()

		newTask.returnCode = int(self.getFieldValue('Return Code', line))
		
		return newTask
		

		#Pulling the taskID


	def nextTask(self):
		"""Moves the filepointer to the next task in the file.  Returns True on find, false if no tasks left"""
		while(True):
			line = self.filePointer.readline()
			if(len(line)== 0):
				return False
			#stripping newlines and ascii escape codes (color) from the line
			if(re.search('Task ID', line)):
				return line 

#			pattern = re.split(r'\x1b[^m]*m|\n', line);
#			#print pattern
#			count = 0
#			for string in pattern:
#				matchObj = re.search('Task ID', string);
#				if(matchObj):
#					print matchObj
#					print pattern[count+1]
#				count += 1
#		#	if(pattern.search("TaskID:")):
#		#		print pattern 
#			if(len(line) == 0):
#				return False
#			i = 0
#			for word in line.split():
#				print word 
#				if word == "TaskID:":
#					print i
#					print word
#					return True
#				i += 1

		
if __name__ == "__main__":
	main()





