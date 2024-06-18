import express from "express"
import * as info from "./info.js"
import cors from 'cors'
// var cors = require('cors')


const app = express()
app.use(express.json())

const p = value => console.log(value)

app.use(cors());
app.use("/photo", express.static('images'))


app.get('/', async (req, res) => {
    res.send("It is work!")

})

app.post('/setUser', async (req, res) => {
    try {
        var data = req.body
        if (data.category == "M" || data.category == "E") {
            if (await (await info.checkUser(data.mail, data.e_number)).checking == 1) {
                info.setUser(data.name, data.mail, data.e_number, data.category, data.password)
                res.status(200).send("The user added succssfuly.")
            } else {
                res.status(400).send("This user is arrdy exitsst!")
            }
        } else {
            res.status(400).send("The category shold be 'M' for manager, or 'E' for employee.")
        }
    } catch (err) {
        res.status(500).send({ message: err.message })
    }
})

app.post('/setSection', async (req, res) => {
    try {
        var data = req.body
        if (await (await info.checkSection(data.description)).checking == 1) {
            info.setImageSection(data.description)
            res.status(200).send("The section added succssfuly.")
        } else {
            res.status(400).send("This section description is arrdy exitsst!")
        }
    } catch (err) {
        res.status(500).send({ message: err.message })
    }

})

app.post('/login', async (req, res) => {
    try {
        var data = req.body
        if (await (await info.checkLoginInfo(data.value, data.password)).checking == 1) {
            res.status(200).send(await info.login(data.value))
        } else {
            res.status(400).send({ message: "User name, or password isn`t courrect!", login: 0 })
        }
    } catch (err) {
        res.status(500).send({ message: err.message })
    }
})

app.post('/image', info.upload.single('image'), async (req, res) => {
    // let {product_name,product_type,product_brand,product_description,product_url } = req.body;

    try {
        // var data = req.body
        let { note, user_ID, section_ID } = req.body;
        await info.setImageInfo(req.file.filename, note, section_ID, user_ID)
        // await info.setImageInfo(data.image_name, data.note, data.user_ID, data.section_ID) //req.file.filename / data.user_ID
        res.status(200).send({ success: 1, message: "The image is uploaded" })
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

// app.post('/image', info.upload.single('image'), (req, res) => {
//     const { image } = req.file;

//     // Save image path to the database
//     const imagePath = `/uploads/${req.file.filename}`; // Adjust the path as per your upload directory
//     const sql = 'INSERT INTO barcode_image (image, note, section_No, user_No) VALUES (?, "The new note", 3, 30)';
//     info.pool.query(sql, [imagePath], (err, result) => {
//         if (err) {
//             console.error('Error saving image path to database:', err);
//             res.status(500).send('Internal server error');
//             return;
//         }
//         console.log('Image path saved to database');
//         res.status(200).send('Image uploaded successfully');
//     });
// });

app.post('/update/user_name/:id', async (req, res) => {
    try {
        var name = req.body.name
        var { id } = req.params
        info.updateUser(id, 'name', name)
        res.status(200).send({ success: 1, message: "The information has been updated." })
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }

})

app.post('/update/user_category/:id', async (req, res) => {
    try {
        var category = req.body.category
        if (category != "M" && category != "E") {
            res.status(500).send({ success: 0, message: "The category shold be 'M' for manager, or 'E' for employee." })
            return
        }
        var { id } = req.params
        info.updateUser(id, 'category', category)
        res.status(200).send({ success: 1, message: "The information has been updated." })
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }

})

app.post('/update/user_email/:id', async (req, res) => {
    try {
        var email = req.body.email
        var { id } = req.params
        info.updateUser(id, 'email', email)
        res.status(200).send({ success: 1, message: "The information has been updated." })
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }

})

app.post('/update/user_e_number/:id', async (req, res) => {
    try {
        var e_No = req.body.e_No
        if (typeof e_No != 'number') {
            res.status(500).send({ success: 0, message: "The value shold be a number." })
            return
        }
        var { id } = req.params
        info.updateUser(id, 'e_No', e_No)
        res.status(200).send({ success: 1, message: "The information has been updated." })
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }

})

app.post('/update/password', async (req, res) => {
    try {
        var data = req.body
        var e_No = data.e_number
        if (await (await info.checkLoginInfo(e_No, data.oldPassword)).checking == 1) {
            info.updatePassword(e_No, data.nowPassword)
            res.status(200).send({ success: 1, message: "The information has been updated." })
        } else {
            res.status(500).send({ success: 0, message: "The old password is not currect!" })
        }

    } catch (err) {
    }

})

app.patch('/reset/password/:employee_number', async (req, res) => {
    try {
        var { employee_number } = req.params
        await info.resetPassword(employee_number)
        res.status(200).send({ success: 1, message: "The information has been updated." })
    } catch (error) {
        res.status(500).send({ success: 0, message: error.message })
    }
})

app.delete('/user/:id', async (req, res) => {
    try {
        var { id } = req.params
        info.deleteUser(id)
        res.status(200).send({ success: 1, message: "The user has been deleted." })
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }

})

app.post('/return/user/:id', async (req, res) => {
    try {
        var { id } = req.params
        info.returnTheUser(id)
        res.status(200).send({ success: 1, message: "The user is returned. " })
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

app.delete('/image/:id', async (req, res) => {
    try {
        var { id } = req.params
        info.deleteImage(id)
        res.status(200).send({ success: 1, message: "The image has been deleted." })
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

app.post('/return/image/:id', async (req, res) => {
    try {
        var { id } = req.params
        info.returnImage(id)
        res.status(200).send({ success: 1, message: "The image has been returned." })
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

app.post('/update/image/note', async (req, res) => {
    try {
        var data = req.body
        await info.updateImageNote(data.ID, data.note)
        res.status(200).send({ success: 1, message: "The image note has been updated." })
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})



app.get('/users', async (req, res) => {
    var data = await info.getUsers()
    data < 1 ? res.status(400).send("No user found!") : res.status(200).send(data)
})

app.get('/user/ID/:ID', async (req, res) => {
    try {
        var { ID } = req.params
        res.status(200).send(await info.getUser('ID', `${ID}`))
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

app.get('/user/name/:name', async (req, res) => {
    try {
        var { name } = req.params
        res.status(200).send(await info.getUser('name', `${name}`))
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

app.get('/user/category/:category', async (req, res) => {
    try {
        var { category } = req.params
        res.status(200).send(await info.getUser('category', `${category}`))
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

app.get('/user/email/:email', async (req, res) => {
    try {
        var { email } = req.params
        res.status(200).send(await info.getUserLogin('email', `${email}`))
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

app.get('/user/number/:number', async (req, res) => {
    try {
        var { number } = req.params
        res.status(200).send(await info.getUserLogin('e_No', `${number}`))
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

app.use(express.static('public'));
app.use('/images', express.static('images'));

app.get('/images', async (req, res) => {
    try {
        res.status(200).send(await info.getImages())
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

app.get('/image/URL/:URL', async (req, res) => {
    try {
        var { URL } = req.params
        res.status(200).send(await info.getImage('image', `${URL}`))
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

app.get('/image/user/ID/:id', async (req, res) => {
    try {
        var { id } = req.params
        res.status(200).send(await info.getImage('user_No', `${id}`))
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

app.get('/image/section/ID/:section_ID', async (req, res) => {
    try {
        var { section_ID } = req.params
        res.status(200).send(await info.getImage('section_No', `${section_ID}`))
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

app.get('/image/note/:note', async (req, res) => {
    try {
        var { note } = req.params
        res.status(200).send(await info.getImage('note', `${note}`))
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

app.get('/image/solved', async (req, res) => {
    try {
        res.status(200).send(await info.getImage('solved', `${1}`))
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

app.get('/image/notsolved', async (req, res) => {
    try {
        res.status(200).send(await info.getImage('solved', `${0}`))
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

app.get('/sections', async (req, res) => {
    try {
        res.status(200).send(await info.getSections())
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

app.get('/section/ID/:id', async (req, res) => {
    try {
        var { id } = req.params
        res.status(200).send(await info.getSectionBy('ID', `${id}`))
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})

app.get('/section/description/:text', async (req, res) => {
    try {
        var { text } = req.params
        res.status(200).send(await info.getSectionBy('description', `${text}`))
    } catch (err) {
        res.status(500).send({ success: 0, message: err.message })
    }
})



app.listen(4432 || process.env.PORT, () => console.log("Started a port 4432"))
