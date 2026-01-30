//HTTP REQUEST
const URL_POST = 'http://localhost:3000/posts'
const COMMENTS_URL = 'http://localhost:3000/comments'

//========= UNTILS =========
async function CleanInput(){
    document.getElementById("id_txt").value = "";
    document.getElementById("title_txt").value = "";
    document.getElementById("views_txt").value = "";
}

async function RenderTable(items, tableId){
    try {
        let body_of_table = document.getElementById(tableId);
        body_of_table.innerHTML = "";
        for (const item of items) {
            let style = item.isDeleted ? "text-decoration: line-through; color: gray;" : "";
            if (item.text !== undefined) {
                body_of_table.innerHTML +=
                    `<tr>
                        <td style="${style}">${item.id}</td>
                        <td style="${style}">${item.text}</td>
                        <td style="${style}">${item.postId}</td>
                    </tr>`;
            } else {
                body_of_table.innerHTML +=
                    `<tr>
                        <td style="${style}">${item.id}</td>
                        <td style="${style}">${item.title}</td>
                        <td style="${style}">${item.views}</td>
                    </tr>`;
            }
        }
    } catch (error) {
        console.log("RenderTable Error: " + error);
    }
}

async function AutoIncreaseId() {
    try {
        let response = await fetch(URL_POST);
        let posts = await response.json();
        if (posts.length === 0)
            return "1";
        else {
            let lastId = Math.max(
                posts.map(
                    function(post){
                        return parseInt(post.id);
                    }
                )
            );
            return (lastId + 1).toString();
        }
    } catch (error) {
        console.log("AutoIncreaseId Error: " + error);
    }
}

async function AutoIncreaseIdForComments() {
    try {
        let response = await fetch(COMMENTS_URL);
        let comments = await response.json();
        if (comments.length === 0)
            return "1";
        else {
            let lastId = Math.max(
                comments.map(comment => parseInt(comment.id))
            );
            return (lastId + 1).toString();
        }
    } catch (error) {
        console.log("AutoIncreaseIdForComments Error: " + error);
    }
}

//========= POST =========
async function GetAllPosts() {
    let avaliablePosts;
    try {
        let response = await fetch(URL_POST);
        let posts = await response.json();
        avaliablePosts = posts.filter(
            function(post)
            {
                return !post.isDeleted;
            }
        );
        RenderTable(avaliablePosts, "table-body");
    } catch (error) {
        console.log("GetAllPost Error: " + error);
    }
}

async function GetAllDeletedPosts() {
    try {
        let response = await fetch(URL_POST);
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
        let response = await fetch(URL_POST + "/" + id);
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

        let checkResponse = await fetch(URL_POST + "/"+ id);
        let method = checkResponse.ok ? "PUT" : "POST";
        let url = checkResponse.ok ? URL_POST + "/" + id : URL_POST;

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

        let response = await fetch(url,
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

        let response = await fetch(URL_POST + "/" + id,
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

async function GetAllComments() {
    try {
        let response = await fetch(COMMENTS_URL);
        let comments = await response.json();
        let availableComments = comments.filter(comment => !comment.isDeleted);
        RenderTable(availableComments, "table-body-comment");
    } catch (error) {
        console.log("GetAllComments Error: " + error);
    }
}

async function GetAllDeletedComments() {
    try {
        let response = await fetch(COMMENTS_URL);
        let comments = await response.json();
        let deletedComments = comments.filter(comment => comment.isDeleted);
        RenderTable(deletedComments, "table-body-comment-delete");
    } catch (error) {
        console.log("GetAllDeletedComments Error: " + error);
    }
}

async function GetAComment(id) {
    try {
        let response = await fetch(COMMENTS_URL + "/" + id);
        let comment = await response.json();
        return comment;
    } catch (error) {
        console.log("GetAComment Error: " + error);
    }
}

async function CreateAComment(){
    try {
        let id = document.getElementById("comment_id_txt").value;  
        let text = document.getElementById("comment_text_txt").value;
        let postId = document.getElementById("comment_postId_txt").value;

        if(!text || !postId){
            alert("Text and PostId are required");
            return;
        }
        
        if(!id)
            id = await AutoIncreaseIdForComments();  

        let checkResponse = await fetch(COMMENTS_URL + "/"+ id);
        let method = checkResponse.ok ? "PUT" : "POST";
        let url = checkResponse.ok ? COMMENTS_URL + "/" + id : COMMENTS_URL;

        let body = {
            id: id,
            text: text,
            postId: postId
        }

        if(method === "PUT"){
            let oldComment = await checkResponse.json();
            body.isDeleted = oldComment.isDeleted;
        } else {
            body.isDeleted = false;
        }

        let response = await fetch(url,
            {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        if(!response.ok)
            throw new Error("Create Comment Failed");
        
        alert("Create Comment Success");
        GetAllComments();
    } catch (error) {
        alert(error);
        console.log("CreateAComment Error: " + error);
    }
}

async function DeleteAComment() {
    try{
        let id = document.getElementById("comment_id_delete").value;  
        if(!id){
            alert("Please enter comment id");
            return;
        }

        let oldComment = await GetAComment(id);
        if(!oldComment){
            alert("Comment not found");
            return;
        }

        let response = await fetch(COMMENTS_URL + "/" + id,
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
            throw new Error("Delete Comment Failed");
        
        alert("Delete Comment Success");
        GetAllComments();
        GetAllDeletedComments();
    }catch(error){
        alert(error);
        console.log("DeleteAComment Error: " + error);
    }
}

GetAllComments();
GetAllDeletedComments();
