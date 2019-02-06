// ID        *primitive.ObjectID `json: "messageId,omitempty" bson: "_id,omitempty"`
// 	Sender    string              `json: "Sender,omitempty" bson: "sender"`
// 	Recipient string              `json: "Recipient,omitempty" bson: "recipient"`
// 	Content   string              `json: "Content,omitempty" bson: "content"`
// 	Sent      string              `json: "Sent,omitempty" bson: "sent"`

import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
export class Message {
    messageId: string = undefined;
    Sender: string = undefined;
    Recipient: string = undefined;
    Content: string = undefined;
    Send: string = undefined;
}