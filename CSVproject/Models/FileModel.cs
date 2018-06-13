using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace CSVproject.Models
{
    public class FileModel
    {
        [Required(ErrorMessage = "Please select file.")]
        [RegularExpression(@"([a-zA-Z0-9\s_\\.\-:])+(.csv)$", ErrorMessage = "Only CSV files allowed.")]
        public HttpPostedFileBase PostedFile { get; set; }
    }
}