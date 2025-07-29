
class UiEventHandler
{
	static buttonSaveAsPngs_Clicked()
	{
		var d = document;
		var divSignatureImages =
			d.getElementById("divSignatureImages");
		var signatureSheetsAsDivElements =
			divSignatureImages.children;

		var sidesPerSheet = 2;

		// Note that some browsers limit the count of downloaded files.

		for (var i = 0; i < signatureSheetsAsDivElements.length; i++)
		{
			var signatureSheetIndex = i;

			var signatureSheetAsDivElement =
				signatureSheetsAsDivElements[signatureSheetIndex];

			var signatureSidesAsCanvases =
				signatureSheetAsDivElement.children;

			for (var j = 0; j < signatureSidesAsCanvases.length; j++)
			{
				var signatureSideIndexAbsolute =
					signatureSheetIndex * sidesPerSheet + j;

				var signatureSideIndexAbsolutePadded =
					("" + signatureSideIndexAbsolute).padStart(2, "0");

				var signatureSideAsCanvas =
					signatureSidesAsCanvases[j];

				var signatureSideAsDataUrl =
					signatureSideAsCanvas.toDataURL("image/png");

				var signatureSideFileName =
					"SignatureSide"
					+ signatureSideIndexAbsolutePadded
					+ ".png";

				var signatureSideAsLink = d.createElement("a");
				signatureSideAsLink.href = signatureSideAsDataUrl;
				signatureSideAsLink.download =
					signatureSideFileName;
				signatureSideAsLink.click();
			}
		}
	}

	static buttonSaveAsTar_Clicked()
	{
		alert("Not yet implemented!");
	}

	static buttonImpose_Clicked()
	{
		var d = document;
		var divPageImagesLoaded =
			d.getElementById("divPageImagesLoaded");
		var pagesAsImgElements = divPageImagesLoaded.children;

		var textareaArrangement =
			d.getElementById("textareaArrangement");
		var arrangementAsString = textareaArrangement.value;

		var newline = "\n";
		var blankLine = newline + newline;
		var space = " ";
		var arrangementSidesAsRowsOfPageNumberOffsets =
			arrangementAsString
			.split(blankLine)
			.map
			(
				x =>
					x.split(newline)
					.map
					(
						y => y.split(space)
					)
			);

		var sideIndicesAndPageOffsetsInPagesFromUpperLeftByPageNumberOffset = new Map();

		for (var s = 0; s < arrangementSidesAsRowsOfPageNumberOffsets.length; s++)
		{
			var sideAsRowsOfPageNumberOffsets =
				arrangementSidesAsRowsOfPageNumberOffsets[s];

			for (var y = 0; y < sideAsRowsOfPageNumberOffsets.length; y++)
			{
				var rowOfPageNumberOffsets = sideAsRowsOfPageNumberOffsets[y];

				for (var x = 0; x < rowOfPageNumberOffsets.length; x++)
				{
					var pageNumberOffset = rowOfPageNumberOffsets[x];

					var sideIndexAndPageOffsetInPagesFromUpperLeft =
						new Coords(x, y, s);

					sideIndicesAndPageOffsetsInPagesFromUpperLeftByPageNumberOffset
						.set(pageNumberOffset, sideIndexAndPageOffsetInPagesFromUpperLeft);
				}
			}
		}

		var pageAsImgElement0 = pagesAsImgElements[0];
		var pageSizeInPixels =
			new Coords(pageAsImgElement0.width, pageAsImgElement0.height);
		var arrangementSide0 = arrangementSidesAsRowsOfPageNumberOffsets[0];
		var signatureSideSizeInPages =
			new Coords(arrangementSide0[0].length, arrangementSide0.length);
		var pagesPerSignatureSide =
			signatureSideSizeInPages.x * signatureSideSizeInPages.y;
		var pagesPerSignatureSheet = pagesPerSignatureSide * 2;
		var signatureSideSizeInPixels =
			signatureSideSizeInPages
				.clone()
				.multiply(pageSizeInPixels);
		var posToDrawPageAtInPixels = new Coords();

		var signatureSheetsSoFar = [];
		var signatureSheetCurrentAsCanvasPairForSides = null;
		var signatureSheetCurrentAsGraphicsContextPairForSides = null;
		var signatureSheetIndexPrev = null;

		for (var pageIndex = 0; pageIndex < pagesAsImgElements.length; pageIndex++)
		{
			var signatureSheetIndex =
				Math.floor(pageIndex / pagesPerSignatureSheet);

			if (signatureSheetIndex != signatureSheetIndexPrev)
			{
				signatureSheetCurrentAsCanvasPairForSides =
				[
					d.createElement("canvas"),
					d.createElement("canvas")
				];
				for (var s = 0; s < signatureSheetCurrentAsCanvasPairForSides.length; s++)
				{
					var signatureSideAsCanvas = signatureSheetCurrentAsCanvasPairForSides[s];
					signatureSideAsCanvas.width = signatureSideSizeInPixels.x;
					signatureSideAsCanvas.height = signatureSideSizeInPixels.y;
				}
				signatureSheetsSoFar.push(signatureSheetCurrentAsCanvasPairForSides);
				signatureSheetCurrentAsGraphicsContextPairForSides =
					signatureSheetCurrentAsCanvasPairForSides.map(x => x.getContext("2d") );

				signatureSheetIndexPrev = signatureSheetIndex;
			}

			var pageAsImgElement = pagesAsImgElements[pageIndex];
			var pageIndexOffset = pageIndex % pagesPerSignatureSheet;
			var pageNumberOffset = "" + (pageIndexOffset+ 1);

			var sideIndexAndPageOffsetInPagesFromUpperLeftInPages =
				sideIndicesAndPageOffsetsInPagesFromUpperLeftByPageNumberOffset
					.get(pageNumberOffset);

			var sideIndex =
				sideIndexAndPageOffsetInPagesFromUpperLeftInPages.z;
			var pageOffsetInPagesFromUpperLeftInPages
				= sideIndexAndPageOffsetInPagesFromUpperLeftInPages;

			posToDrawPageAtInPixels
				.overwriteWith(pageOffsetInPagesFromUpperLeftInPages)
				.multiply(pageSizeInPixels);

			var signatureSideAsGraphics =
				signatureSheetCurrentAsGraphicsContextPairForSides[sideIndex];

			signatureSideAsGraphics.save(); // In case the page must be rotated.

			if (pageOffsetInPagesFromUpperLeftInPages.y == 0)
			{
				// Pages on the top row of signatures are rotated half a turn.
				signatureSideAsGraphics.rotate(Math.PI);
				posToDrawPageAtInPixels.x *= -1;
				posToDrawPageAtInPixels.x += 0 - pageSizeInPixels.x;
				posToDrawPageAtInPixels.y = 0 - pageSizeInPixels.y;
			}

			signatureSideAsGraphics.drawImage
			(
				pageAsImgElement,
				posToDrawPageAtInPixels.x, posToDrawPageAtInPixels.y
			);

			signatureSideAsGraphics.restore();
		}

		var divSignatureImages =
			d.getElementById("divSignatureImages");
		divSignatureImages.innerHTML = "";

		for (var signatureIndex = 0; signatureIndex < signatureSheetsSoFar.length; signatureIndex++)
		{
			var signatureSheetAsCanvasPairForSides =
				signatureSheetsSoFar[signatureIndex];
			var signatureSheetAsDivElement = d.createElement("div");
			for (var sideIndex = 0; sideIndex < signatureSheetAsCanvasPairForSides.length; sideIndex++)
			{
				var sideAsCanvas = signatureSheetAsCanvasPairForSides[sideIndex];
				signatureSheetAsDivElement.appendChild(sideAsCanvas);
			}
			divSignatureImages.appendChild(signatureSheetAsDivElement);
		}
	}

	static inputFile_Changed(inputFile)
	{
		var d = document;
		var divPageImagesLoaded =
			d.getElementById("divPageImagesLoaded");
		divPageImagesLoaded.innerHTML = "";

		var files = inputFile.files;
		for (var i = 0; i < files.length; i++)
		{
			var file = files[i];
			var fileReader = new FileReader();
			fileReader.onload = (event) =>
			{
				var fileAsDataUrl = event.target.result;
				var fileAsImgElement = d.createElement("img");
				fileAsImgElement.src = fileAsDataUrl;
				divPageImagesLoaded.appendChild(fileAsImgElement);
			};
			fileReader.readAsDataURL(file);
		}
	}

	static selectArrangementPreset_Changed(selectArrangementPreset)
	{
		var arrangementName = selectArrangementPreset.value;

		var newline = "\n";
		var delimiterRows = newline;
		var delimiterSides = newline + newline;

		var arrangementAsString =
			(arrangementName == "Folio")
			? "4 1" + delimiterSides + "2 3"
			: (arrangementName == "Quarto")
			? "5 4" + delimiterRows + "8 1" + delimiterSides + "3 6" + delimiterRows + "2 7"
			: (arrangementName == "Octavo")
			? "5 12 9 8" + delimiterRows + "4 13 16 1" + delimiterSides + "3 14 15 2" + delimiterRows + "6 11 10 7"
			: (arrangementName == "Duodecimo (12mo)")
			? null
			: (arrangementName == "Sextodecimo (16mo)")
			? null
			: null;

		if (arrangementAsString == null)
		{
			arrangementAsString =
				"Arrangement unknown or not implemented: " + arrangementName + ".";
		}

		var d = document;
		var textareaArrangement = d.getElementById("textareaArrangement");
		textareaArrangement.value = arrangementAsString;
	}
}
