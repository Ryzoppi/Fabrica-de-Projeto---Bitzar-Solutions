namespace Api.Model
{
    public class FileUploadModel
    {
        public string? Description { get; set; }
        public IFormFile File { get; set; }
    }
}