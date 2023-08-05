let chai = require("chai");
let chaiHttp = require("chai-http");
let expect = chai.expect;
let fs = require("fs");
chai.use(chaiHttp);
let postResponseData = require("./response_data/post_response.json");
let jp = require("jsonpath");

describe("API POST Requests", () => {
  it("Add a new pet to the store - Specify tags and status", (done) => {
    const newPost = {
      id: null,
      category: {
        id: 1,
        name: "first_category",
      },
      name: "doggie",
      photoUrls: ["https://puppy.com"],
      tags: [
        {
          id: 1,
          name: "Hello_Puppy",
        },
      ],
      status: "available",
    };

    chai
      .request("https://petstore.swagger.io/v2/")
      .post("pet/")
      .send(newPost)
      .end((err, res) => {
        expect(res).to.have.status(200); // Assuming you return 200 for successful creation
        expect(res.body.photoUrls[0]).eq(newPost.photoUrls[0]);
        expect(res.body.category)
          .to.have.property("id")
          .eq(newPost.category.id);
        expect(res.body.category)
          .to.have.property("name")
          .eq(newPost.category.name);
        expect(res.body).to.have.property("status").eq(newPost.status);

        //store the ID of the post_response.json
        postResponseData.id = res.body.id;
        fs.writeFileSync(
          "./response_data/post_response.json",
          JSON.stringify(postResponseData)
        );

        done();
      });
  });

  it("Add multiple pets to the store", (done) => {
    let i = 0;
    while (i < 4) {
      var newPost = {
        id: 1,
        category: {
          id: Math.floor(Math.random() * 101).toString(),
          name: Math.random().toString(36).substring(7),
        },
        name: "doggie",
        photoUrls: ["https://puppy.com"],
        tags: [
          {
            id: Math.floor(Math.random() * 101).toString(),
            name: Math.random().toString(36).substring(7),
          },
        ],
        status: Math.random().toString(36).substring(7),
      };

      chai
        .request("https://petstore.swagger.io/v2/")
        .post("pet/")
        .send(newPost)
        .end((err, res) => {
          expect(res).to.have.status(200); // Assuming you return 200 for successful creation
          //  console.log(res.body)
        });

      i++;
    }
    done();
  });

  it("Update an existing pet", (done) => {
    let jsonData;

    jsonData = JSON.parse(
      fs.readFileSync("./response_data/post_response.json", "utf8")
    );

    const newPost = {
      id: jsonData.id,
      category: {
        id: 1,
        name: "second_category",
      },
      name: "doggie",
      photoUrls: ["https://puppy.com"],
      tags: [
        {
          id: 1,
          name: "Hello_Puppy_02",
        },
      ],
      status: "busy",
    };

    chai
      .request("https://petstore.swagger.io/v2/")
      .put("pet/")
      .send(newPost)
      .end((err, res) => {
        expect(res).to.have.status(200); // Assuming you return 200 for successful update
        expect(res.body).to.have.property("id").eq(newPost.id);
        expect(res.body.category)
          .to.have.property("name")
          .eq(newPost.category.name);

        console.log(
          "Ped with ID :  " + jsonData.id + " is successfully updated"
        );
      });
    done();
  });

  it("Find Pets by statuses", (done) => {
    //For Sold
    chai
      .request("https://petstore.swagger.io/v2/pet")
      .get("/findByStatus?status=sold")
      .end((err, res) => {
        expect(res).to.have.status(200); // Assuming you return 200 for successful update
        const responseData = res.body;
        var statuses = jp.query(responseData, "$..status");
        for (i = 0; i < statuses.length; i++) {
          expect(statuses[i]).eq("sold");
        }
      });
    //For Pending
    chai
      .request("https://petstore.swagger.io/v2/pet")
      .get("/findByStatus?status=pending")
      .end((err, res) => {
        expect(res).to.have.status(200); // Assuming you return 200 for successful update
        const responseData = res.body;
        var statuses = jp.query(responseData, "$..status");
        for (i = 0; i < statuses.length; i++) {
          expect(statuses[i]).eq("pending");
        }
      });

    //For Available
    chai
      .request("https://petstore.swagger.io/v2/pet")
      .get("/findByStatus?status=available")
      .end((err, res) => {
        expect(res).to.have.status(200); // Assuming you return 200 for successful update
        const responseData = res.body;
        var statuses = jp.query(responseData, "$..status");
        for (i = 0; i < statuses.length; i++) {
          expect(statuses[i]).eq("available");
        }
      });

    done();
  });

  it("Find Pets by Tags", (done) => {
    //For string
    chai
      .request("https://petstore.swagger.io/v2/pet")
      .get("/findByTags?tags=string")
      .end((err, res) => {
        expect(res).to.have.status(200);
        const responseData = res.body;
        var tags = jp.query(responseData, "$..tags");
        for (i = 0; i < tags.length; i++) {
          expect(tags[i][0].name).eq("string");
        }
      });

    done();
  });
});
