 using Microsoft.AspNetCore.Mvc;
 using OfficeOpenXml;
 [ApiController]
 [Route("api/excel")]
 public class ExcelController : ControllerBase
 {
         [HttpPost("upload")]
         public async Task<IActionResult> Upload(IFormFile file)
         {
            ExcelPackage.License.SetNonCommercialPersonal("Guilherme");
             using var stream = new MemoryStream();
             await file.CopyToAsync(stream);
             using var package = new ExcelPackage(stream);
             var worksheet = package.Workbook.Worksheets[0];
             var data = new List<Dictionary<string, object>>();
             for (int row = 2; row <= worksheet.Dimension.Rows; row++)
             {
                 var rowData = new Dictionary<string, object>();
                 for (int col = 1; col <= worksheet.Dimension.Columns; col++)
                 {
                     var header = worksheet.Cells[1, col].Text;
                     var value = worksheet.Cells[row, col].Text;
                     rowData[header] = value;

                 data.Add(rowData);
            }
        }
        return Ok(data);
    }

}