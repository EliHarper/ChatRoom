package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/mongodb/mongo-go-driver/bson"
	"github.com/mongodb/mongo-go-driver/mongo"
	"github.com/mongodb/mongo-go-driver/mongo/readpref"
)

func configDB() *mongo.Collection {
	client, err := mongo.Connect(context.Background(), "mongodb://172.17.0.3:27017")
	if err != nil {
		log.Panicf("appsec: mongo client couldn't connect with background context: %v", err)
	}

	chatDB := client.Database("chat_db")

	err = client.Ping(context.Background(), readpref.Primary())
	if err != nil {
		log.Panicf("Server connection error; status: %v", err)
	}

	return chatDB.Collection("messages")
}

func persistMessage(w http.ResponseWriter, r *http.Request) {

	message, err := ioutil.ReadAll(r.Body)
	defer r.Body.Close()
	if err != nil {
		log.Panicf("Error reading request body: %v", err)
	}

	var m Message
	err = json.Unmarshal(message, &m)

	if err != nil {
		log.Panicf("Error unmarshalling input: %v", err)
	}

	messagesColl := configDB()
	sent := time.Now().UTC()
	sentStr := sent.String()

	fmt.Printf("m: %v", m)
	fmt.Printf("message: %v", message)

	res, err := messagesColl.InsertOne(
		context.Background(),
		bson.D{
			{"sender", m.Sender},
			{"recipient", m.Recipient},
			{"content", m.Content},
			{"sent", sentStr},
		},
	)
	if err != nil {
		log.Panicf("Error inserting message into mongo: %v", err)
	}

	id := res.InsertedID
	idJSON, err2 := json.Marshal(id)
	if err2 != nil {
		log.Panicf("Error marshaling id: %v", err2)
	}

	log.Printf("Inserted new message with id %v", idJSON)

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(idJSON)
}

func loadMessages(w http.ResponseWriter, r *http.Request) {

	messageColl := configDB()
	cursor, err := messageColl.Find(context.Background(), bson.D{})

	if err != nil {
		log.Panicf("Error during db.messages.find() query: %v", err)
	}
	defer cursor.Close(context.Background())

	var results []bson.Raw
	messageRead := Message{}
	for cursor.Next(context.Background()) {
		var elem bson.Raw
		err := cursor.Decode(&elem)
		if err != nil {
			log.Panicf("messageRead = %v\n", messageRead)
		}
		results = append(results, elem)
	}

	if err := cursor.Err(); err != nil {
		log.Panic(err)
	}

	cursor.Close(context.Background())

	var typedMessage Message
	var typedMessageArray []Message
	for index := 0; index < len(results); index++ {
		thisMessage := results[index]
		err := bson.Unmarshal(thisMessage, &typedMessage)
		if err != nil {
			log.Panicf("Error occurred during bson.Unmarshal: %v", err)
		} else {
			fmt.Printf("typedMessage: %v", typedMessage)
			typedMessageArray = append(typedMessageArray, typedMessage)
		}
	}

	messagesJSON, err := json.Marshal(typedMessageArray)
	if err != nil {
		log.Panicf("Error occurred during json.Marshal: %v", err)
	}

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	w.Write(messagesJSON)
}
