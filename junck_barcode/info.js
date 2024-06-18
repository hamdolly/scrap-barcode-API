import mysql from "mysql2"
import bcrypt from "bcrypt"
import multer from "multer"
import path from 'path'

// var p = value => console.log(value)

export const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "scrap_barcode"
}).promise()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, "barcode" + "_" + Date.now() + path.extname(file.originalname))
    }
})


export const upload = multer({ storage: storage })

export const setImageInfo = async (image, note, section_ID, user_ID) => {
    await pool.query(`INSERT INTO barcode_image (image, note, section_No, user_No) VALUES ('${image}', '${note}', ${section_ID}, ${user_ID})`)//, [`${image}`, `${note}`, `${section_ID}`, `${user_ID}`])
}

export const checkUserAndSection = async (user_ID, section_ID) => {
    var checking = true
    var [user] = await pool.query(`SELECT COUNT(*) AS rs FROM user WHERE ID = ${user_ID} AND BLOCK = 0 AND off = 0)`)
    var [section] = await pool.query(`SELECT COUNT(*) AS rs FROM barcode_image WHERE ID = ${section_ID} AND BLOCK = 0)`)
    if (user[0].rs == 1 && section[0].rs == 1) {
        checking = 1
    } else {
        checking = 0
    }
    return {
        checking
    }

}// Not used

export const checkUser = async (mail, e_No) => {
    var checking = true;
    var [check] = await pool.query(`SELECT COUNT(*) AS rs FROM login WHERE email = '${mail}' AND e_No = ${e_No}`)
    if (check[0].rs >= 1) {
        checking = 0
    } else {
        checking = 1
    }
    return {
        checking
    }
}

export const checkSection = async description => {
    var checking = true
    var [check] = await pool.query(`SELECT COUNT(*) AS rs FROM image_section WHERE description = '${description}'`)
    if (check[0].rs >= 1) {
        checking = 0
    } else {
        checking = 1
    }
    return {
        checking
    }
}

export const checkLoginInfo = async (e_No, password) => {
    var checking = true
    var [login_info] = await pool.query(`SELECT *, COUNT(*) AS rs FROM login WHERE e_No = ${e_No}`)
    if (login_info[0].rs == 1) {
        var checkPassword = await bcrypt.compare(password, login_info[0].password)
        if (checkPassword) {
            checking = 1
        } else {
            checking = 2
        }
    } else {
        checking = 0
    }
    var result = password
    return {
        checking,
        result
    }
}

export const setUser = async (name, mail, e_No, category, password) => {
    var data = []
    var hashed = await bcrypt.hash(password, 13)
    await pool.query(`INSERT INTO login (email, e_No, password) 
    VALUES (?, ?, ?)`, [mail, e_No, hashed])
    var [login_ID] = await pool.query(`SELECT * FROM login 
    WHERE email = ? AND e_No = ?`, [mail, e_No])
    await pool.query(`INSERT INTO user (name, category, login_No) 
    VALUES (?, ?, ?)`, [name, category, login_ID[0].ID.toString()])
    data.push(
        {
            "Message": "User added Successfully"
        }
    )
    return data
}

export const setImageSection = async description => {
    await pool.query(`INSERT INTO image_section (description) VALUES ('${description}')`)
}

export const login = async (e_No) => {
    e_No == undefined ? e_No = none : e_No = e_No
    var data = []
    var [login_info] = await pool.query(`SELECT * FROM login WHERE e_No = ?`, [e_No])
    var login_ID = login_info[0].ID.toString()
    var [user_info] = await pool.query(`SELECT * FROM user WHERE login_No = ?`, [login_ID])
    if (user_info.length >= 1 && user_info[0].BLOCK == 0) {
        data.push(
            {
                "ID": `${user_info[0].ID.toString()}`,
                "name": `${user_info[0].name}`,
                "email": `${login_info[0].email}`,
                "category": `${user_info[0].category}`,
                "employee_number": `${login_info[0].e_No}`,
                "login": 1
            }
        )
    } else {
        data.push(
            {
                "Message": "Cann`t use this accunt."
            }
        )
    }

    return data
}

export const updateUser = async (ID, column, nowValue) => {
    var [login_info] = await pool.query(`SELECT login_No FROM user WHERE ID = ${ID}`)
    var sql = [`UPDATE user SET ${column} = '${nowValue}' WHERE ID = ${ID}`,
    `UPDATE login SET ${column} = '${nowValue}' WHERE ID = ${login_info[0].login_No.toString()}`]
    switch (column) {
        case 'name':
            await pool.query(sql[0])
            break;

        case 'category':
            await pool.query(sql[0])
            break;

        case 'email':
            await pool.query(sql[1])
            break;

        case 'e_No':
            await pool.query(sql[1])
            break;

    }
}

export const updatePassword = async (e_No, nowPassword) => {
    // var [login_info] = await pool.query(`SELECT * FROM user WHERE ID = ${ID}`)
    var hashed = await bcrypt.hash(nowPassword, 13)
    var sql = `UPDATE login SET password = '${hashed}' WHERE e_No = ${e_No}`
    await pool.query(sql)
    return;
}

export const resetPassword = async (e_No) =>{
    var hashed = await bcrypt.hash("123", 13)
    // var [user_info] = await pool.query(`SELECT * FROM user WHERE ID = ?`, [value])
    // var [login_info] = await pool.query(`SELECT * FROM login WHERE ID = ?`, [user_info[0].login_No.toString()])
    var sql = `UPDATE login SET password = '${hashed}' WHERE e_No = ${e_No}`
    await pool.query(sql)
    return;
}

export const deleteUser = async (ID) => {
    await pool.query(`UPDATE user SET BLOCK = 1 WHERE ID = ${ID}`)
}

export const returnTheUser = async (ID) => {
    await pool.query(`UPDATE user SET BLOCK = 0 WHERE ID = ${ID}`)
}

export const deleteImage = async (ID) => {
    await pool.query(`UPDATE barcode_image SET BLOCK = 1 WHERE ID = ${ID}`)
}

export const returnImage = async (ID) => {
    await pool.query(`UPDATE barcode_image SET BLOCK = 0 WHERE ID = ${ID}`)
}

export const updateImageNote = async (image_ID, new_note) => {
    await pool.query(`UPDATE barcode_image SET note = '${new_note}' WHERE ID = ${image_ID}`)
}

// export const getUsers = async (condition = 'none', value = 'none') => {
//     var send;
//     switch (condition) {
//         case 'none':
//             send = userInfo()
//             break;
//     }
//     condition = "";
//     value = "";

//     return send
// }

const userInfo = async (condition = 'none', value = 'none') => {
    var sql = ["SELECT * FROM user WHERE BLOCK = 0", `SELECT * FROM user WHERE ${condition} = '${value}' AND BLOCK = 0`]
    var data = []
    var [user] = await pool.query(condition == 'none' ? sql[0] : sql[1])
    for (var num = 0; num < user.length; num++) {
        var [login_data] = await pool.query(`SELECT * FROM login WHERE ID = ${user[num].login_No.toString()}`)
        if (user[num].off.toString() == 0) {
            data.push(
                {
                    "ID": `${user[num].ID.toString()}`,
                    "name": `${user[num].name}`,
                    "email": `${login_data[0].email}`,
                    "category": `${user[num].category}`,
                    "employee_number": `${login_data[0].e_No}`
                }
            )
        } else {
            data.push(
                {
                    "Message": "Cann`t use this accunt."
                }
            )
        }
    }

    return data
}

const userInfoByLogin = async (condition, value) => {
    var sql = `SELECT * FROM login WHERE ${condition} = '${value}'`
    var data = []
    var [login] = await pool.query(sql)
    for (var num = 0; num < login.length; num++) {
        var [user] = await pool.query(`SELECT * FROM user WHERE login_No = ${login[num].ID.toString()}`)
        if (user[num].BLOCK == 0) {
            data.push(
                {
                    "ID": `${user[num].ID.toString()}`,
                    "name": `${user[num].name}`,
                    "email": `${login[0].email}`,
                    "category": `${user[num].category}`,
                    "employee_number": `${login[0].e_No}`
                }
            )
        } else {
            data.push(
                {
                    "Message": "Cann`t use this accunt."
                }
            )
        }
    }

    return data
}

export const getUsers = async () => {
    return await userInfo();
}

export const getUser = async (condition, value) => {
    return await userInfo(condition, value);
}

export const getUserLogin = async (condition, value) => {
    return await userInfoByLogin(condition, value)
}

const images = async () => {
    var data = []
    var [images] = await pool.query(`SELECT * FROM barcode_image WHERE BLOCK = 0`)
    for (var i = 0; i <= images.length - 1; i++) {
        var [section] = await pool.query(`SELECT * FROM image_section WHERE ID = ${images[i].section_No.toString()}`)
        var [user] = await pool.query(`SELECT * FROM user WHERE ID = ${images[i].user_No.toString()}`)
        if (section[0].BLOCK == 1) {
            continue;
        }
        data.push(
            {
                "ID": `${images[i].ID}`,
                "image": `${images[i].image}`,
                "note": `${images[1].note}`,
                "user_ID": `${images[i].user_No.toString()}`,
                "section_ID": `${images[i].section_No.toString()}`,
                "section_name": `${section[0].description}`,
                "solved": `${images[i].solved == 0 ? "No" : "Yes"}`
            }
        )
    }

    return data
}

const image = async (condition, value) => {
    var data = []
    var [images] = await pool.query(`SELECT * FROM barcode_image WHERE ${condition} = ? AND BLOCK = 0`, [value])
    for (var i = 0; i <= images.length - 1; i++) {
        var [section] = await pool.query(`SELECT * FROM image_section WHERE ID = ${images[i].section_No.toString()}`)
        var [user] = await pool.query(`SELECT * FROM user WHERE ID = ${images[i].user_No.toString()}`)
        if (section[0].BLOCK == 1) {
            continue;
        }
        data.push(
            {
                "image": `${images[i].image}`,
                "note": `${images[i].note}`,
                "user_ID": `${images[i].user_No.toString()}`,
                "section_ID": `${images[i].section_No.toString()}`,
                "section_name": `${section[0].description}`,
                "solved": `${images[i].solved == 0 ? "No" : "Yes"}`
            }
        )
    }

    return data
}

export const getImages = async () => {
    return await images()
}

export const getImage = async (condition, value) => {
    return await image(`${condition}`, `${value}`)
}

const section = async (condition = 'none', value = 'none') => {
    var data = []
    var sql = [`SELECT * FROM image_section`, `SELECT * FROM image_section WHERE ${condition} = '${value}'`]
    var [section] = await pool.query(condition == 'none' ? sql[0] : sql[1])
    for (var i = 0; i <= section.length - 1; i++) {
        if (section[i].BLOCK == 0) {
            data.push(
                {
                    "ID": `${section[i].ID.toString()}`,
                    "description": `${section[i].description}`
                }
            )
        } else if (condition != 'none') {
            data.push(
                {
                    "Message": "This section is no longer used",
                    "succes": 0
                }
            )
        } else {
            continue;
        }
    }
    return data
}

export const getSections = async () => {
    return section()
}

export const getSectionBy = async (condition, value) => {
    return await section(`${condition}`, `${value}`)
}