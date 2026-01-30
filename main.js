//HTTP REQUEST
const URL = 'http://localhost:3000/posts'
const COMMENTS_URL = 'http://localhost:3000/comments'

//========= UNTILS =========
async function CleanInput(){
    document.getElementById("id_txt").value = "";
    document.getElementById("title_txt").value = "";
    document.getElementById("views_txt").value = "";
}

async function RenderTable(posts, tableId){
    try {
        let body_of_table = document.getElementById(tableId);
        body_of_table.innerHTML = "";
        for (const post of posts) {
            let style = post.isDeleted ? "text-decoration: line-through; color: gray;" : "";
            body_of_table.innerHTML +=
                `<tr>
                    <td style="${style}">${post.id}</td>
                    <td style="${style}">${post.title}</td>
                    <td style="${style}">${post.views}</td>
                </tr>`
        }
    } catch (error) {
        console.log("RenderTable Error: " + error);
    }
}

async function AutoIncreaseId() {
    try {
        let response = await fetch(URL);
        let posts = await response.json();
        if (posts.lenght === 0)
            return "1";
        else {
            let lastId = Math.max(posts.map(
                function(post){
                    return parseInt(post.id);
                }
            ));
            return (lastId + 1).toString();
        }
    } catch (error) {
        console.log("AutoIncreaseId Error: " + error);
    }
}

//========= POST =========
async function GetAllPosts() {
    try {
        let response = await fetch(URL_POSTS);
        let posts = await response.json();
        let avaliblePosts = posts.filter(
            function(post)
            {
                return !post.isDeleted;
            }
        );
        RenderTable(availablePosts, "table-body");
    } catch (error) {
        console.log("GetAllPost Error: " + error);
    }
}

async function GetAllDeletedPosts() {
    try {
        let response = await fetch(URL);
        let posts = await response.json();
        let deletedPosts = posts.filter(
            function(post)
            {
                return post.isDeleted;
            }
        );
        RenderTable(deletedPosts, "table-body-delete");
    } catch (error) {
        console.log("GetAllDeletedPosts Error: " + error);
    }
}

async function GetAPost(id) {
    try {
        let response = await fetch(URL + "/" + id);
        let post = await response.json();
        return post;
    } catch (error) {
        console.log("GetAPost Error: " + error);
    }
}

async function CreateAPost(){
    try {
        let id = document.getElementById("id_txt").value;
        let title = document.getElementById("title_txt").value;
        let views = document.getElementById("views_txt").value;

        if(!title || !views){
            alert("Title and Views are required");
            return;
        }
        
        if(!id)
            id = await AutoIncreaseId();

        let checkResponse = await fetch(URL + "/"+ id);
        let method = checkResponse.ok ? "PUT" : "POST";
        let url = checkResponse.ok ? URL + "/" + id : URL;

        let body = {
            id: id,
            title: title,
            views: views
        }

        if(method === "PUT"){
            let oldPost = await checkResponse.json();
            body.isDeleted = oldPost.isDeleted;
        } else {
            body.isDeleted = false;
        }

        let response = await fetch(URL,
            {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        if(!response.ok)
            throw new Error("Create Post Failed");
        
        alert("Create Post Success");
        GetAllPosts();
        CleanInput();

    } catch (error) {
        alert(error);
        console.log("CreateAPost Error: " + error);
    }
}

async function DeleteAPost() {
    try{
        let id = document.getElementById("id_delete").value;
        if(!id){
            alert("Please enter id");
            return;
        }

        let oldPost = await GetAPost(id);
        if(!oldPost){
            alert("Post not found");
            return;
        }

        let response = await fetch(URL + "/" + id,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    isDeleted: true
                })
            }
        );

        if(!response.ok)
            throw new Error("Delete Post Failed");
        
        alert("Delete Post Success");
        GetAllPosts();
        GetAllDeletedPosts();
        document.getElementById("id_delete").value = "";
    }catch(error){
        alert(error);
        console.log("DeleteAPost Error: " + error);
    }
}

GetAllPosts();
GetAllDeletedPosts();

//========= COMMENT =========
