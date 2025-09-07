
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BasarSoftProje;
using BasarSoftProje.Domain;
using BasarSoftProje.Infrastructure;
using BasarSoftProje.Infrastructure.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System.IO;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;

namespace BasarSoftProje.Controllers
{
    [ApiController]
    [Route("api/features")]
    public class FeaturesController : ControllerBase
    {
        private readonly IUnitOfWork _uow;
        private readonly GeometryFactory _gf = new(new PrecisionModel(), 4326);
        private readonly WKTReader _reader;
        private readonly WKTWriter _writer = new();

        public FeaturesController(IUnitOfWork uow)
        {
            _uow = uow;
            _reader = new WKTReader(_gf);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Response<FeatureReadDto>), 201)]
        [ProducesResponseType(typeof(Response<object>), 400)]
        public async Task<IActionResult> CreateEf([FromBody] FeatureCreateDto dto, CancellationToken ct)
        {
            if (!ModelState.IsValid)
                return BadRequest(Response<object>.Fail("Validation failed", ValidationErrors()));

            var geom = ParseWktOrBadRequest(dto.Wkt);
            if (geom is null)
                return BadRequest(Response<object>.Fail("Invalid WKT"));

            var typeVal = string.IsNullOrWhiteSpace(dto.Type) ? "A" : dto.Type.Trim();
            var blocks = await _uow.Features.IntersectsBlockingAsync(geom);
            if (blocks)
                return BadRequest(Response<string>.Fail("B tipindeki çizgi ile kesiştiği için eklenemez"));

            var entity = new Feature { Name = dto.Name, Wkt = dto.Wkt, Geometry = geom, Type = typeVal };
            await _uow.Features.AddAsync(entity);
            await _uow.SaveChangesAsync(); 

            var payload = new FeatureReadDto
            {
                Id = entity.Id,
                Name = entity.Name,
                Wkt = _writer.Write(entity.Geometry),
                Geometry = entity.Geometry!,
                Photos = entity.Photos
            };

            return CreatedAtAction(nameof(GetEf), new { id = entity.Id }, Response<FeatureReadDto>.Ok(payload, "Created"));
        }

        [HttpPost("addrange")]
        [ProducesResponseType(typeof(Response<object>), 201)]
        [ProducesResponseType(typeof(Response<object>), 400)]
        public async Task<IActionResult> AddRangeEf([FromBody] List<FeatureCreateDto> dtos, CancellationToken ct)
        {
            if (dtos is null || dtos.Count == 0)
                return BadRequest(Response<object>.Fail("List can't be empty"));
            if (!ModelState.IsValid)
                return BadRequest(Response<object>.Fail("Validation failed", ValidationErrors()));

            var list = new List<Feature>(dtos.Count);
            foreach (var dto in dtos)
            {
                var g = ParseWktOrBadRequest(dto.Wkt);
                if (g is null) return BadRequest(Response<object>.Fail($"Unvalid WKT: {dto.Wkt}"));
                list.Add(new Feature { Name = dto.Name, Wkt = dto.Wkt, Geometry = g });
            }

            await _uow.Features.AddRangeAsync(list);
            await _uow.SaveChangesAsync();

            var items = list.Select(x => new FeatureReadDto
            {
                Id = x.Id,
                Name = x.Name,
                Wkt = _writer.Write(x.Geometry!),
                Geometry = x.Geometry!
            }).ToList();

            var body = new { count = items.Count, items };
            return Created("/api/features/addrange", Response<object>.Ok(body, "Created"));
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(Response<FeatureReadDto>), 200)]
        [ProducesResponseType(typeof(Response<string>), 404)]
        public async Task<IActionResult> GetEf(int id, CancellationToken ct)
        {
            var f = await _uow.Features.GetByIdAsync(id);
            if (f is null)
                return NotFound(Response<string>.Fail("Feature not found"));

            var dto = new FeatureReadDto
            {
                Id = f.Id,
                Name = f.Name,
                Wkt = f.Geometry is null ? f.Wkt : _writer.Write(f.Geometry),
                Geometry = f.Geometry!,
                Photos = f.Photos
            };

            return Ok(Response<FeatureReadDto>.Ok(dto));
        }

        [HttpGet]
        [ProducesResponseType(typeof(Response<Paged<FeatureReadDto>>), 200)]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] string? name = null,
            CancellationToken ct = default)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0 || pageSize > 500) pageSize = 50;

            var all = await _uow.Features.WhereAsync(x => string.IsNullOrEmpty(name) || x.Name.Contains(name));
            var total = all.Count;
            var items = all
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(f => new FeatureReadDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Wkt = f.Geometry is null ? f.Wkt : _writer.Write(f.Geometry),
                    Geometry = f.Geometry!,
                    Photos = f.Photos
                })
                .ToList();

            var pageDto = new Paged<FeatureReadDto>
            {
                Total = total,
                Page = page,
                PageSize = pageSize,
                Items = items
            };

            return Ok(Response<Paged<FeatureReadDto>>.Ok(pageDto));
        }

        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(Response<FeatureReadDto>), 200)]
        [ProducesResponseType(typeof(Response<string>), 404)]
        [ProducesResponseType(typeof(Response<string>), 400)]
        public async Task<IActionResult> UpdateEf(int id, [FromBody] FeatureUpdateDto dto, CancellationToken ct)
        {
            if (!ModelState.IsValid)
                return BadRequest(Response<object>.Fail("Validation failed", ValidationErrors()));

            var f = await _uow.Features.GetByIdAsync(id);
            if (f is null)
                return NotFound(Response<string>.Fail("Feature not found"));

            var geom = ParseWktOrBadRequest(dto.Wkt);
            if (geom is null)
                return BadRequest(Response<string>.Fail("Invalid WKT"));

            f.Name = dto.Name;
            f.Wkt = dto.Wkt;
            f.Geometry = geom;
            f.Type = string.IsNullOrWhiteSpace(dto.Type) ? "A" : dto.Type.Trim();

            var blocksUpd = await _uow.Features.IntersectsBlockingAsync(geom, excludeId: f.Id);
            if (blocksUpd)
                return BadRequest(Response<string>.Fail("B tipindeki çizgi ile kesiştiği için güncellenemez"));

            _uow.Features.Update(f);
            await _uow.SaveChangesAsync();

            var read = new FeatureReadDto
            {
                Id = f.Id,
                Name = f.Name,
                Wkt = _writer.Write(f.Geometry!),
                Geometry = f.Geometry!,
                Photos = f.Photos
            };
            return Ok(Response<FeatureReadDto>.Ok(read, "Updated"));
        }

        [HttpPost("{id:int}/photos")]
        [RequestSizeLimit(50_000_000)]
        [ProducesResponseType(typeof(Response<object>), 200)]
        [ProducesResponseType(typeof(Response<string>), 404)]
        public async Task<IActionResult> UploadPhotos(int id, [FromForm] IFormFile[] files, CancellationToken ct)
        {
            var f = await _uow.Features.GetByIdAsync(id);
            if (f is null)
                return NotFound(Response<string>.Fail("Feature not found"));

            if (files == null || files.Length == 0)
                return BadRequest(Response<string>.Fail("No files uploaded"));

            var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "photos");
            Directory.CreateDirectory(uploadsRoot);

            var publicUrls = new List<string>();
            foreach (var file in files)
            {
                if (file.Length <= 0) continue;
                var ext = Path.GetExtension(file.FileName);
                var fileName = $"{Guid.NewGuid():N}{ext}";
                var filePath = Path.Combine(uploadsRoot, fileName);
                await using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream, ct);
                }
                publicUrls.Add($"/photos/{fileName}");
            }

            var current = f.Photos?.ToList() ?? new List<string>();
            current.AddRange(publicUrls);
            f.Photos = current.ToArray();

            _uow.Features.Update(f);
            await _uow.SaveChangesAsync();

            return Ok(Response<object>.Ok(new { id = f.Id, photos = f.Photos }, "Uploaded"));
        }

        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(Response<object>), 200)]
        [ProducesResponseType(typeof(Response<string>), 404)]
        public async Task<IActionResult> DeleteEf(int id, CancellationToken ct)
        {
            var f = await _uow.Features.GetByIdAsync(id);
            if (f is null)
                return NotFound(Response<string>.Fail("Feature not found"));

            _uow.Features.Remove(f);
            await _uow.SaveChangesAsync();

            return Ok(Response<object>.Ok(new { id }, "Deleted"));
        }

        private Geometry? ParseWktOrBadRequest(string wkt)
        {
            try
            {
                var g = _reader.Read(wkt);
                g.SRID = 4326;
                return g;
            }
            catch (Exception)
            {
                return null;
            }
        }

        private Dictionary<string, string[]> ValidationErrors()
        {
            return ModelState
                .Where(kvp => kvp.Value?.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
                );
        }


    }
}