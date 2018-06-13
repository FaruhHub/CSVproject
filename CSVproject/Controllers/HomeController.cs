using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CSVproject.Models;
using System.IO;
using System.Data;
using LumenWorks.Framework.IO.Csv;
using CSVproject.AppServices;
using CSVproject.Util;

namespace CSVproject.Controllers
{
    public class HomeController : Controller
    {
        // GET: Home
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Index(HttpPostedFileBase postedFile)
        {
            string path = Server.MapPath("~/Uploads/");
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }

            if (postedFile != null)
            {
                string fileName = Path.GetFileName(postedFile.FileName);
                postedFile.SaveAs(path + fileName);
                ViewBag.Message = string.Format("<br /><b>{0}</b> uploaded.<br />", fileName);
                ViewBag.Message += string.Format("<button type='button' onclick='ShowFileSettings({0})'>Show File Settings</button><br />", "\""+ fileName + "\"");
            }

            return View();
        }

        [HttpGet]
        public ActionResult GetCSVfileHeaders(string fileName)
        {
            string path = Server.MapPath("~/Uploads/");
            string fileHeaders = System.IO.File.ReadLines(path + fileName).First(); // gets the headers line from file.
            string[] columnNames = null;

            if (!string.IsNullOrEmpty(fileHeaders))
            {
                if (fileHeaders.Contains(','))
                    columnNames = fileHeaders.Split(',');
                else if (fileHeaders.Contains('|'))
                    columnNames = fileHeaders.Split('|');
            }
            return Json(columnNames, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult LoadCSVdataToDB(string fileName,string columns)
        {
            string path = Server.MapPath("~/Uploads/");
            string tableName = "ImortedData_" + DateTime.Now.ToString("yyyyMMddHHmmss");
            string createTableSqlCommand = "CREATE TABLE " + tableName + "(";

            if (columns.EndsWith(";"))
                columns = columns.Remove(columns.Length - 1);

            string[] colNames = columns.Split(';');

            // DataTable data which will be inserted to DB
            DataTable dt = new DataTable();
            foreach (var col in colNames)
            {
                dt.Columns.Add(new DataColumn(col, typeof(string)));
                createTableSqlCommand += col + " NVARCHAR(200),";
            }
            createTableSqlCommand = createTableSqlCommand.Remove(createTableSqlCommand.Length - 1);
            createTableSqlCommand += ")";

            using (CsvReader csvReader = new CsvReader(new StreamReader(path + fileName), hasHeaders: true))
            {
                //getting rows count number
                int itemsCount = System.IO.File.ReadLines(path + fileName).Count();

                int i = 0;
                while (csvReader.ReadNextRecord())
                {
                    dt.Rows.Add();
                    foreach (var col in colNames)
                    {
                        dt.Rows[i][col] = csvReader[col];
                    }
                    //SignalR. CALLING A FUNCTION THAT CALCULATES PERCENTAGE AND SENDS THE DATA TO THE CLIENT
                    Functions.SendProgress("Process in progress...", i, itemsCount);
                    i++;
                }
            }            

            DbServices.CreateTable(createTableSqlCommand);
            DbServices.DoSqlBulkCopy(tableName,dt);

            return Json("success", JsonRequestBehavior.AllowGet);
        }

        
    }
}
